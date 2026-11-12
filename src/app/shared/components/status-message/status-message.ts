import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-status-message',
  imports: [MatIconModule],
  templateUrl: './status-message.html',
  styleUrl: './status-message.scss',
})
export class StatusMessage {
  readonly icon = input.required<string>();
  readonly heading = input.required<string>();
  readonly message = input('');
}
