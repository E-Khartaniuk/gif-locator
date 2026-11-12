import { Component, input, output } from '@angular/core';
import { Gif } from '../../../core/models/gif.model';

@Component({
  imports: [],
  selector: 'app-gif-card',
  styleUrl: './gif-card.scss',
  templateUrl: './gif-card.html',
})
export class GifCard {
  readonly gif = input.required<Gif>();
  readonly selected = output<Gif>();
}
