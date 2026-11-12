import { inject, Injectable, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

import { Gif } from '../models/gif.model';
import { FileDownload } from './file-download';

@Injectable({ providedIn: 'root' })
export class GifDownloader {
  private readonly fileDownload = inject(FileDownload);
  private readonly snackBar = inject(MatSnackBar);

  private readonly inProgress = signal<ReadonlySet<string>>(new Set());

  isDownloading(id: string): boolean {
    return this.inProgress().has(id);
  }

  download(gif: Gif): void {
    if (this.isDownloading(gif.id)) return;

    this.setInProgress(gif.id, true);
    this.fileDownload
      .download(gif.originalUrl, this.toFileName(gif))
      .pipe(finalize(() => this.setInProgress(gif.id, false)))
      .subscribe({
        error: () => this.snackBar.open('Download failed. Please try again.'),
      });
  }

  private setInProgress(id: string, active: boolean): void {
    this.inProgress.update((ids) => {
      const next = new Set(ids);
      if (active) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  private toFileName(gif: Gif): string {
    const slug = gif.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `${slug || gif.id}.gif`;
  }
}
