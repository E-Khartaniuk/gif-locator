import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { GiphyListResponseDto } from '../models/giphy-api.models';
import { GifPage } from '../models/gif.model';
import { toGifPage } from '../mappers/gif.mapper';

export const PAGE_SIZE = 20;

@Injectable({ providedIn: 'root' })
export class GiphyApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.giphyApiUrl;

  search(query: string, page = 0): Observable<GifPage> {
    const params = this.pageParams(page).set('q', query);
    return this.http
      .get<GiphyListResponseDto>(`${this.baseUrl}/gifs/search`, { params })
      .pipe(map(toGifPage));
  }

  trending(page = 0): Observable<GifPage> {
    return this.http
      .get<GiphyListResponseDto>(`${this.baseUrl}/gifs/trending`, { params: this.pageParams(page) })
      .pipe(map(toGifPage));
  }

  private pageParams(page: number): HttpParams {
    return new HttpParams()
      .set('limit', PAGE_SIZE)
      .set('offset', page * PAGE_SIZE)
      .set('rating', 'g');
  }
}