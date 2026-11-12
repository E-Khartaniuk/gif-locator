import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Gif } from '../../../core/models/gif.model';

@Component({
  selector: 'app-gif-card',
  imports: [MatIconModule, MatProgressSpinnerModule],
  styleUrl: './gif-card.scss',
  templateUrl: './gif-card.html',
})
export class GifCard {
  readonly gif = input.required<Gif>();
  readonly downloading = input(false);

  readonly selected = output<Gif>();
  readonly download = output<Gif>();
}
