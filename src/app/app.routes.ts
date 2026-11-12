import { Routes } from '@angular/router';
import { GifSearchPage } from './features/gif-search/gif-search-page/gif-search-page';

export const routes: Routes = [
  { path: '', component: GifSearchPage },
  { path: '**', redirectTo: '' },
];
