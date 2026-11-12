import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, distinctUntilChanged, map, of, startWith, switchMap } from 'rxjs';

import { GiphyApi } from '../../../core/services/giphy-api';
import { Gif, GifPage } from '../../../core/models/gif.model';
import { GifCard } from '../../../shared/components/gif-card/gif-card';
import { SearchBar } from '../components/search-bar/search-bar';

type SearchState =
  { status: 'loading' } | { status: 'success'; result: GifPage } | { status: 'error' };

interface SearchParams {
  query: string;
  page: number;
}

@Component({
  selector: 'app-gif-search-page',
  imports: [GifCard, SearchBar],
  templateUrl: './gif-search-page.html',
  styleUrl: './gif-search-page.scss',
})
export class GifSearchPage {
  private readonly giphyApi = inject(GiphyApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly params$ = this.route.queryParamMap.pipe(
    map((params): SearchParams => ({
      query: (params.get('q') ?? '').trim(),
      page: Math.max(Number(params.get('page')) || 1, 1) - 1,
    })),
    distinctUntilChanged((a, b) => a.query === b.query && a.page === b.page),
  );

  protected readonly params = toSignal(this.params$, { initialValue: { query: '', page: 0 } });

  private readonly state = toSignal(
    this.params$.pipe(
      switchMap(({ query, page }) => {
        const request$ = query ? this.giphyApi.search(query, page) : this.giphyApi.trending(page);
        return request$.pipe(
          map((result): SearchState => ({ status: 'success', result })),
          catchError(() => of<SearchState>({ status: 'error' })),
          startWith<SearchState>({ status: 'loading' }),
        );
      }),
    ),
    { initialValue: { status: 'loading' } as SearchState },
  );

  protected readonly isLoading = computed(() => this.state().status === 'loading');
  protected readonly hasError = computed(() => this.state().status === 'error');

  protected readonly gifs = computed<Gif[]>(() => {
    const state = this.state();
    return state.status === 'success' ? state.result.items : [];
  });

  protected readonly isEmpty = computed(
    () => this.state().status === 'success' && this.gifs().length === 0,
  );

  protected onSearch(query: string): void {
    this.router.navigate([], {
      queryParams: { q: query || null, page: null },
    });
  }

  protected onGifSelected(gif: Gif): void {
    console.log('selected', gif);
  }
}
