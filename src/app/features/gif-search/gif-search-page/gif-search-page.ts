import { Component, effect, inject, Injector, untracked } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';

import { GIF_RATINGS, GifRating } from '../../../core/models/gif.model';
import { GifDownloader } from '../../../core/services/gif-downloader';
import { PAGE_SIZE } from '../../../core/services/giphy-api';
import { GifCard } from '../../../shared/components/gif-card/gif-card';
import { StatusMessage } from '../../../shared/components/status-message/status-message';
import {
  GIF_DETAILS_DIALOG_CONFIG,
  GifDetailsDialog,
} from '../components/gif-details-dialog/gif-details-dialog';
import { SearchBar } from '../components/search-bar/search-bar';
import { GifSearchStore, SearchError } from '../gif-search-store';

@Component({
  selector: 'app-gif-search-page',
  imports: [
    GifCard,
    SearchBar,
    StatusMessage,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatPaginator,
    MatSelectModule,
    UpperCasePipe,
  ],
  providers: [GifSearchStore],
  templateUrl: './gif-search-page.html',
  styleUrl: './gif-search-page.scss',
})
export class GifSearchPage {
  protected readonly store = inject(GifSearchStore);
  protected readonly gifDownloader = inject(GifDownloader);
  private readonly dialog = inject(MatDialog);
  private readonly injector = inject(Injector);

  protected readonly pageSize = PAGE_SIZE;
  protected readonly ratings = GIF_RATINGS;
  protected readonly ratingHints: Record<GifRating, string> = {
    g: 'All ages',
    pg: 'Mild',
    'pg-13': 'Teens',
    r: 'Mature',
  };

  protected readonly skeletons = Array.from({ length: PAGE_SIZE }, (_, index) => index);

  protected readonly errorTexts: Record<SearchError, { heading: string; message: string }> = {
    'rate-limit': {
      heading: 'Too many requests',
      message: 'The Giphy API limit has been reached. Please wait a few minutes and try again.',
    },
    network: {
      heading: 'No connection',
      message: 'Check your internet connection and try again.',
    },
    unknown: {
      heading: 'Something went wrong',
      message: 'We could not load GIFs. Please try again.',
    },
  };

  private dialogRef: MatDialogRef<GifDetailsDialog> | null = null;

  constructor() {
    effect(() => {
      const isOpen = this.store.selectedGifId() !== null;
      untracked(() => (isOpen ? this.openDialog() : this.dialogRef?.close()));
    });
  }

  protected onPageChange(event: PageEvent): void {
    this.store.goToPage(event.pageIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private openDialog(): void {
    if (this.dialogRef) return;

    this.dialogRef = this.dialog.open(GifDetailsDialog, {
      ...GIF_DETAILS_DIALOG_CONFIG,
      injector: this.injector,
    });

    this.dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = null;
      this.store.closeGif();
    });
  }
}
