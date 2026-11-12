import { Component, computed, inject } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { GifDownloader } from '../../../../core/services/gif-downloader';
import { FileSizePipe } from '../../../../shared/pipes/file-size-pipe';
import { GifSearchStore } from '../../gif-search-store';

export const GIF_DETAILS_DIALOG_CONFIG: MatDialogConfig = {
  width: '900px',
  maxWidth: '95vw',
  autoFocus: 'dialog',
};

@Component({
  selector: 'app-gif-details-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DatePipe,
    UpperCasePipe,
    FileSizePipe,
  ],
  templateUrl: './gif-details-dialog.html',
  styleUrl: './gif-details-dialog.scss',
  host: {
    '(document:keydown.arrowleft)': 'store.selectPrev()',
    '(document:keydown.arrowright)': 'store.selectNext()',
  },
})
export class GifDetailsDialog {
  protected readonly store = inject(GifSearchStore);
  private readonly clipboard = inject(Clipboard);
  private readonly snackBar = inject(MatSnackBar);
  private readonly gifDownloader = inject(GifDownloader);

  protected readonly gif = this.store.selectedGif;

  protected readonly isDownloading = computed(() => {
    const gif = this.gif();
    return gif ? this.gifDownloader.isDownloading(gif.id) : false;
  });

  protected copyLink(): void {
    const gif = this.gif();
    if (!gif) return;

    const copied = this.clipboard.copy(gif.originalUrl);
    this.showMessage(copied ? 'Link copied to clipboard' : 'Could not copy the link');
  }

  protected download(): void {
    const gif = this.gif();
    if (gif) this.gifDownloader.download(gif);
  }

  private showMessage(message: string): void {
    this.snackBar.open(message);
  }
}
