import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { Clipboard } from '@angular/cdk/clipboard';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

import { Gif } from '../../../../core/models/gif.model';
import { FileDownload } from '../../../../core/services/file-download';
import { FileSizePipe } from '../../../../shared/pipes/file-size-pipe';

export interface GifDetailsDialogData {
  gifs: Gif[];
  startIndex: number;
}

@Component({
  selector: 'app-gif-details-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule, DatePipe, UpperCasePipe, FileSizePipe],
  templateUrl: './gif-details-dialog.html',
  styleUrl: './gif-details-dialog.scss',
  host: {
    '(document:keydown.arrowleft)': 'prev()',
    '(document:keydown.arrowright)': 'next()',
  },
})
export class GifDetailsDialog {
  private readonly data = inject<GifDetailsDialogData>(MAT_DIALOG_DATA);
  private readonly clipboard = inject(Clipboard);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fileDownload = inject(FileDownload);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isDownloading = signal(false);

  protected readonly gifs = this.data.gifs;
  protected readonly index = signal(this.data.startIndex);

  protected readonly gif = computed(() => this.gifs[this.index()]);
  protected readonly hasPrev = computed(() => this.index() > 0);
  protected readonly hasNext = computed(() => this.index() < this.gifs.length - 1);

  protected prev(): void {
    if (this.hasPrev()) this.index.update((i) => i - 1);
  }

  protected next(): void {
    if (this.hasNext()) this.index.update((i) => i + 1);
  }

  protected copyLink(): void {
    const copied = this.clipboard.copy(this.gif().originalUrl);
    this.showMessage(copied ? 'Link copied to clipboard' : 'Could not copy the link');
  }

  protected download(): void {
    const gif = this.gif();
    this.isDownloading.set(true);

    this.fileDownload
      .download(gif.originalUrl, this.toFileName(gif))
      .pipe(
        finalize(() => this.isDownloading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        error: () => this.showMessage('Download failed. Please try again.'),
      });
  }

  private toFileName(gif: Gif): string {
    const slug = gif.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `${slug || gif.id}.gif`;
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, undefined, { duration: 2500 });
  }
}
