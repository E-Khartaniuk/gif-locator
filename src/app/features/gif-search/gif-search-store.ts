import { HttpErrorResponse } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  catchError,
  combineLatest,
  distinctUntilChanged,
  map,
  of,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';

import {
  DEFAULT_GIF_RATING,
  Gif,
  GifPage,
  GifRating,
  isGifRating,
} from '../../core/models/gif.model';
import { GiphyApi, MAX_PAGE_INDEX, MAX_RESULTS, PAGE_SIZE } from '../../core/services/giphy-api';

export interface SearchParams {
  query: string;
  page: number;
  rating: GifRating;
}

export type SearchError = 'rate-limit' | 'network' | 'unknown';

type SearchState =
  | { status: 'loading' }
  | { status: 'success'; result: GifPage }
  | { status: 'error'; error: SearchError };

function toSearchError(error: unknown): SearchError {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 429) return 'rate-limit';
    if (error.status === 0) return 'network';
  }
  return 'unknown';
}

interface GifLookup {
  id: string;
  gif: Gif | null;
}

type PendingSelection = 'first' | 'last';

@Injectable()
export class GifSearchStore {
  private readonly giphyApi = inject(GiphyApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly params$ = this.route.queryParamMap.pipe(
    map((params): SearchParams => {
      const rating = params.get('rating');
      return {
        query: (params.get('q') ?? '').trim(),
        page: Math.min(Math.max(Number(params.get('page')) || 1, 1) - 1, MAX_PAGE_INDEX),
        rating: isGifRating(rating) ? rating : DEFAULT_GIF_RATING,
      };
    }),
    distinctUntilChanged(
      (a, b) => a.query === b.query && a.page === b.page && a.rating === b.rating,
    ),
  );

  private readonly retry$ = new Subject<void>();

  private readonly state = toSignal(
    combineLatest([this.params$, this.retry$.pipe(startWith(undefined))]).pipe(
      switchMap(([{ query, page, rating }]) => {
        const request$ = query
          ? this.giphyApi.search(query, page, rating)
          : this.giphyApi.trending(page, rating);
        return request$.pipe(
          map((result): SearchState => ({ status: 'success', result })),
          catchError((error: unknown) =>
            of<SearchState>({ status: 'error', error: toSearchError(error) }),
          ),
          startWith<SearchState>({ status: 'loading' }),
        );
      }),
    ),
    { initialValue: { status: 'loading' } as SearchState },
  );

  readonly params = toSignal(this.params$, {
    initialValue: { query: '', page: 0, rating: DEFAULT_GIF_RATING } as SearchParams,
  });

  readonly isLoading = computed(() => this.state().status === 'loading');
  readonly hasError = computed(() => this.state().status === 'error');

  readonly error = computed<SearchError | null>(() => {
    const state = this.state();
    return state.status === 'error' ? state.error : null;
  });

  readonly gifs = computed<Gif[]>(() => {
    const state = this.state();
    return state.status === 'success' ? state.result.items : [];
  });

  readonly isEmpty = computed(() => this.state().status === 'success' && this.gifs().length === 0);

  readonly totalCount = computed(() => {
    const state = this.state();
    return state.status === 'success' ? Math.min(state.result.totalCount, MAX_RESULTS) : 0;
  });

  readonly selectedGifId = toSignal(
    this.route.queryParamMap.pipe(
      map((params) => params.get('gif')),
      distinctUntilChanged(),
    ),
    { initialValue: null },
  );

  readonly selectedIndex = computed(() =>
    this.gifs().findIndex((gif) => gif.id === this.selectedGifId()),
  );

  readonly lastPageIndex = computed(() =>
    Math.min(Math.max(Math.ceil(this.totalCount() / PAGE_SIZE) - 1, 0), MAX_PAGE_INDEX),
  );

  /** 1-based position of the selected GIF across all pages, or null if it is not in the list. */
  readonly selectedPosition = computed(() => {
    const index = this.selectedIndex();
    return index === -1 ? null : this.params().page * PAGE_SIZE + index + 1;
  });

  /** Which GIF to select once the next/previous page is loaded while browsing in the dialog. */
  private readonly pendingSelection = signal<PendingSelection | null>(null);

  /** Id of a selected GIF that is not on the current page, e.g. opened from a shared link. */
  private readonly missingGifId = computed(() => {
    const id = this.selectedGifId();
    if (!id || this.isLoading() || this.pendingSelection() || this.selectedIndex() !== -1) {
      return null;
    }
    return id;
  });

  private readonly lookup = toSignal(
    toObservable(this.missingGifId).pipe(
      switchMap((id) =>
        id
          ? this.giphyApi.getById(id).pipe(
              map((gif): GifLookup => ({ id, gif })),
              catchError(() => of<GifLookup>({ id, gif: null })),
            )
          : of(null),
      ),
    ),
    { initialValue: null },
  );

  readonly selectedGif = computed<Gif | null>(() => {
    const index = this.selectedIndex();
    if (index !== -1) return this.gifs()[index];

    const lookup = this.lookup();
    return lookup && lookup.id === this.selectedGifId() ? lookup.gif : null;
  });

  readonly isSelectedGifLoading = computed(() => {
    const id = this.selectedGifId();
    if (!id || this.selectedGif()) return false;
    return this.isLoading() || this.pendingSelection() !== null || this.lookup()?.id !== id;
  });

  readonly hasPrev = computed(() => {
    const index = this.selectedIndex();
    return index > 0 || (index === 0 && this.params().page > 0);
  });

  readonly hasNext = computed(() => {
    const index = this.selectedIndex();
    if (index === -1) return false;
    return index < this.gifs().length - 1 || this.params().page < this.lastPageIndex();
  });

  constructor() {
    effect(() => {
      const pending = this.pendingSelection();
      if (!pending) return;

      if (!this.selectedGifId() || this.hasError()) {
        this.pendingSelection.set(null);
        return;
      }

      const gifs = this.gifs();
      if (this.isLoading() || gifs.length === 0) return;

      const target = pending === 'first' ? gifs[0] : gifs[gifs.length - 1];
      if (this.selectedGifId() === target.id) {
        this.pendingSelection.set(null);
      } else {
        this.navigate({ gif: target.id }, true);
      }
    });
  }

  search(query: string): void {
    this.pendingSelection.set(null);
    this.navigate({ q: query || null, page: null, gif: null });
  }

  retry(): void {
    this.retry$.next();
  }

  setRating(rating: GifRating): void {
    this.pendingSelection.set(null);
    this.navigate({
      rating: rating === DEFAULT_GIF_RATING ? null : rating,
      page: null,
      gif: null,
    });
  }

  goToPage(pageIndex: number): void {
    this.navigate({ page: this.toPageParam(pageIndex) });
  }

  openGif(id: string): void {
    this.navigate({ gif: id });
  }

  closeGif(): void {
    this.pendingSelection.set(null);
    this.navigate({ gif: null });
  }

  selectPrev(): void {
    if (!this.hasPrev()) return;

    const index = this.selectedIndex();
    if (index > 0) {
      this.selectAt(index - 1);
    } else {
      this.switchPageInDialog(this.params().page - 1, 'last');
    }
  }

  selectNext(): void {
    if (!this.hasNext()) return;

    const index = this.selectedIndex();
    if (index < this.gifs().length - 1) {
      this.selectAt(index + 1);
    } else {
      this.switchPageInDialog(this.params().page + 1, 'first');
    }
  }

  private selectAt(index: number): void {
    this.navigate({ gif: this.gifs()[index].id }, true);
  }

  private switchPageInDialog(pageIndex: number, selection: PendingSelection): void {
    this.pendingSelection.set(selection);
    this.navigate({ page: this.toPageParam(pageIndex) }, true);
  }

  private toPageParam(pageIndex: number): number | null {
    return pageIndex === 0 ? null : pageIndex + 1;
  }

  private navigate(queryParams: Record<string, string | number | null>, replaceUrl = false): void {
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge', replaceUrl });
  }
}
