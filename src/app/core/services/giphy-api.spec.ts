import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { GiphyGifDto, GiphyListResponseDto } from '../models/giphy-api.models';
import { GifPage } from '../models/gif.model';
import { GiphyApi, PAGE_SIZE } from './giphy-api';

const gifDto: GiphyGifDto = {
  id: 'abc123',
  title: 'Cat GIF',
  url: 'https://giphy.com/gifs/abc123',
  username: '',
  source: '',
  rating: 'g',
  import_datetime: '2021-05-10 14:30:00',
  images: {
    original: { url: 'https://media.giphy.com/original.gif', width: '480', height: '270' },
    fixed_width: { url: 'https://media.giphy.com/200w.gif', width: '200', height: '113' },
  },
};

const listResponse: GiphyListResponseDto = {
  data: [gifDto],
  pagination: { total_count: 100, count: 1, offset: 0 },
};

describe('GiphyApi', () => {
  let api: GiphyApi;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    api = TestBed.inject(GiphyApi);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('searches with query, pagination and rating params', () => {
    let result: GifPage | undefined;
    api.search('cats', 2, 'pg-13').subscribe((page) => (result = page));

    const request = httpTesting.expectOne(
      (req) => req.url === `${environment.giphyApiUrl}/gifs/search`,
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('q')).toBe('cats');
    expect(request.request.params.get('limit')).toBe(String(PAGE_SIZE));
    expect(request.request.params.get('offset')).toBe(String(2 * PAGE_SIZE));
    expect(request.request.params.get('rating')).toBe('pg-13');
    request.flush(listResponse);

    expect(result?.totalCount).toBe(100);
    expect(result?.items[0].id).toBe('abc123');
    expect(result?.items[0].width).toBe(480);
  });

  it('uses the first page and G rating by default', () => {
    api.trending().subscribe();

    const request = httpTesting.expectOne(
      (req) => req.url === `${environment.giphyApiUrl}/gifs/trending`,
    );
    expect(request.request.params.get('offset')).toBe('0');
    expect(request.request.params.get('rating')).toBe('g');
    expect(request.request.params.has('q')).toBe(false);
    request.flush(listResponse);
  });

  it('loads a single GIF by id', () => {
    let title: string | undefined;
    api.getById('abc123').subscribe((gif) => (title = gif.title));

    httpTesting.expectOne(`${environment.giphyApiUrl}/gifs/abc123`).flush({ data: gifDto });

    expect(title).toBe('Cat GIF');
  });

  it('passes HTTP errors to the subscriber', () => {
    let status: number | undefined;
    api.trending().subscribe({ error: (error) => (status = error.status) });

    httpTesting
      .expectOne((req) => req.url === `${environment.giphyApiUrl}/gifs/trending`)
      .flush(null, { status: 429, statusText: 'Too Many Requests' });

    expect(status).toBe(429);
  });
});
