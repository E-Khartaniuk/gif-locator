import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Params, Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';

import { Gif, GifPage } from '../../core/models/gif.model';
import { GiphyApi } from '../../core/services/giphy-api';
import { GifSearchStore } from './gif-search-store';

function createGif(id: string): Gif {
  return {
    id,
    title: `GIF ${id}`,
    pageUrl: `https://giphy.com/gifs/${id}`,
    previewUrl: `https://media.giphy.com/${id}/200w.gif`,
    originalUrl: `https://media.giphy.com/${id}/giphy.gif`,
    width: 480,
    height: 270,
    sizeBytes: 1024,
    rating: 'g',
    source: '',
    createdAt: null,
    author: null,
  };
}

function createPage(ids: string[], totalCount = 100): GifPage {
  return { items: ids.map(createGif), totalCount, offset: 0 };
}

describe('GifSearchStore', () => {
  let queryParams$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let giphyApi: {
    search: ReturnType<typeof vi.fn>;
    trending: ReturnType<typeof vi.fn>;
    getById: ReturnType<typeof vi.fn>;
  };
  let router: { navigate: ReturnType<typeof vi.fn> };

  function createStore(params: Params = {}): GifSearchStore {
    queryParams$.next(convertToParamMap(params));
    return TestBed.inject(GifSearchStore);
  }

  function setParams(params: Params): void {
    queryParams$.next(convertToParamMap(params));
  }

  beforeEach(() => {
    queryParams$ = new BehaviorSubject(convertToParamMap({}));
    giphyApi = {
      search: vi.fn(() => of(createPage(['a', 'b', 'c']))),
      trending: vi.fn(() => of(createPage(['t1', 't2']))),
      getById: vi.fn(),
    };
    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        GifSearchStore,
        { provide: ActivatedRoute, useValue: { queryParamMap: queryParams$ } },
        { provide: Router, useValue: router },
        { provide: GiphyApi, useValue: giphyApi },
      ],
    });
  });

  describe('URL params', () => {
    it('loads trending GIFs with default params when the URL is empty', () => {
      const store = createStore();

      expect(store.params()).toEqual({ query: '', page: 0, rating: 'g' });
      expect(giphyApi.trending).toHaveBeenCalledWith(0, 'g');
      expect(store.gifs().map((gif) => gif.id)).toEqual(['t1', 't2']);
    });

    it('searches with query, page and rating from the URL', () => {
      const store = createStore({ q: '  cats ', page: '3', rating: 'pg-13' });

      expect(store.params()).toEqual({ query: 'cats', page: 2, rating: 'pg-13' });
      expect(giphyApi.search).toHaveBeenCalledWith('cats', 2, 'pg-13');
    });

    it.each([
      [{ page: '-5' }, 0],
      [{ page: 'abc' }, 0],
      [{ page: '0' }, 0],
    ])('falls back to the first page for %j', (params, expectedPage) => {
      expect(createStore(params).params().page).toBe(expectedPage);
    });

    it('falls back to the default rating for an unknown value', () => {
      expect(createStore({ rating: 'bogus' }).params().rating).toBe('g');
    });

    it('does not reload the list when only the selected GIF changes', () => {
      createStore({ q: 'cats' });
      setParams({ q: 'cats', gif: 'b' });

      expect(giphyApi.search).toHaveBeenCalledTimes(1);
    });
  });

  describe('states', () => {
    it('reports an empty result', () => {
      giphyApi.search.mockReturnValue(of(createPage([], 0)));

      expect(createStore({ q: 'qwzx' }).isEmpty()).toBe(true);
    });

    it.each([
      [429, 'rate-limit'],
      [0, 'network'],
      [500, 'unknown'],
    ])('maps HTTP status %i to the "%s" error', (status, expectedError) => {
      giphyApi.trending.mockReturnValue(throwError(() => new HttpErrorResponse({ status })));

      expect(createStore().error()).toBe(expectedError);
    });

    it('repeats the request on retry', () => {
      giphyApi.trending
        .mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 0 })))
        .mockReturnValueOnce(of(createPage(['t1'])));
      const store = createStore();

      store.retry();

      expect(giphyApi.trending).toHaveBeenCalledTimes(2);
      expect(store.error()).toBeNull();
      expect(store.gifs().map((gif) => gif.id)).toEqual(['t1']);
    });
  });

  describe('navigation', () => {
    it('resets page and selected GIF on a new search', () => {
      createStore({ q: 'cats', page: '3' }).search('dogs');

      expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: { q: 'dogs', page: null, gif: null },
        queryParamsHandling: 'merge',
        replaceUrl: false,
      });
    });

    it('removes the rating from the URL when the default rating is selected', () => {
      createStore({ rating: 'pg' }).setRating('g');

      expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: { rating: null, page: null, gif: null },
        queryParamsHandling: 'merge',
        replaceUrl: false,
      });
    });
  });

  describe('selection', () => {
    it('selects a GIF from the current page', () => {
      const store = createStore({ q: 'cats', gif: 'b' });

      expect(store.selectedGif()?.id).toBe('b');
      expect(store.selectedPosition()).toBe(2);
      expect(store.hasPrev()).toBe(true);
      expect(store.hasNext()).toBe(true);
    });

    it('moves to the next GIF without adding a history entry', () => {
      createStore({ q: 'cats', gif: 'b' }).selectNext();

      expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: { gif: 'c' },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });

    it('switches to the next page from the last GIF on the page', () => {
      createStore({ q: 'cats', gif: 'c' }).selectNext();

      expect(router.navigate).toHaveBeenCalledWith([], {
        queryParams: { page: 2 },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    });

    it('cannot go back from the first GIF on the first page', () => {
      const store = createStore({ q: 'cats', gif: 'a' });

      store.selectPrev();

      expect(store.hasPrev()).toBe(false);
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });
});
