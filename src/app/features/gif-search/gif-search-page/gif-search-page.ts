import { Component, inject, signal } from '@angular/core';
import { GiphyApi } from '../../../core/services/giphy-api';
import { Gif } from '../../../core/models/gif.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GifCard } from '../../../shared/components/gif-card/gif-card';

@Component({
  imports: [GifCard],
  selector: 'app-gif-search-page',
  styleUrl: './gif-search-page.scss',
  templateUrl: './gif-search-page.html',
})
export class GifSearchPage {
  private readonly giphyApi = inject(GiphyApi);

  protected readonly gifs = signal<Gif[]>([]);
  protected readonly isLoading = signal(false);

  constructor() {
    this.isLoading.set(true);
    this.giphyApi
      .trending()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (page) => {
          this.gifs.set(page.items);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  protected onGifSelected(gif: Gif): void {
    console.log('selected', gif);
  }
}
