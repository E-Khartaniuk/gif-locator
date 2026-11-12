import { Component, effect, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';

const SEARCH_DEBOUNCE_MS = 400;

@Component({
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatIconButton],
  selector: 'app-search-bar',
  styleUrl: './search-bar.scss',
  templateUrl: './search-bar.html',
})
export class SearchBar {
  readonly query = input('');
  readonly queryChange = output<string>();

  protected readonly control = new FormControl('', { nonNullable: true });

  constructor() {
    effect(() => {
      this.control.setValue(this.query(), { emitEvent: false });
    });

    this.control.valueChanges
      .pipe(
        map((value) => value.trim()),
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((value) => this.queryChange.emit(value));
  }

  protected submit(): void {
    this.queryChange.emit(this.control.value.trim());
  }

  protected clear(): void {
    this.control.setValue('');
  }
}
