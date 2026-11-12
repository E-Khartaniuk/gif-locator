import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { GiphyGifResponseDto, GiphyListResponseDto } from '../models/giphy-api.models';
import { DEFAULT_GIF_RATING, Gif, GifPage, GifRating } from '../models/gif.model';
import { toGif, toGifPage } from '../mappers/gif.mapper';

export const PAGE_SIZE = 21;
export const MAX_RESULTS = 5000;
export const MAX_PAGE_INDEX = Math.floor((MAX_RESULTS - 1) / PAGE_SIZE);

@Injectable({ providedIn: 'root' })
export class GiphyApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.giphyApiUrl;

  search(query: string, page = 0, rating: GifRating = DEFAULT_GIF_RATING): Observable<GifPage> {
    const params = this.listParams(page, rating).set('q', query);
    return this.http
      .get<GiphyListResponseDto>(`${this.baseUrl}/gifs/search`, { params })
      .pipe(map(toGifPage));
  }

  trending(page = 0, rating: GifRating = DEFAULT_GIF_RATING): Observable<GifPage> {
    const params = this.listParams(page, rating);
    return this.http
      .get<GiphyListResponseDto>(`${this.baseUrl}/gifs/trending`, { params })
      .pipe(map(toGifPage));
  }

  getById(id: string): Observable<Gif> {
    return this.http
      .get<GiphyGifResponseDto>(`${this.baseUrl}/gifs/${encodeURIComponent(id)}`)
      .pipe(map((response) => toGif(response.data)));
  }

  private listParams(page: number, rating: GifRating): HttpParams {
    return new HttpParams()
      .set('limit', PAGE_SIZE)
      .set('offset', page * PAGE_SIZE)
      .set('rating', rating);
  }
}
