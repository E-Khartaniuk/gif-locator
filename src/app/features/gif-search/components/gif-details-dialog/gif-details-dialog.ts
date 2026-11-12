import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Gif } from '../../../../core/models/gif.model';
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
}
