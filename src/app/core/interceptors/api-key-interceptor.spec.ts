import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { apiKeyInterceptor } from './api-key-interceptor';

describe('apiKeyInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiKeyInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('adds the API key to Giphy API requests', () => {
    http.get(`${environment.giphyApiUrl}/gifs/trending`).subscribe();

    const request = httpTesting.expectOne((req) => req.url.startsWith(environment.giphyApiUrl));
    expect(request.request.params.get('api_key')).toBe(environment.giphyApiKey);
    request.flush({});
  });

  it('keeps existing query params', () => {
    http.get(`${environment.giphyApiUrl}/gifs/search`, { params: { q: 'cats' } }).subscribe();

    const request = httpTesting.expectOne((req) => req.url.startsWith(environment.giphyApiUrl));
    expect(request.request.params.get('q')).toBe('cats');
    expect(request.request.params.has('api_key')).toBe(true);
    request.flush({});
  });

  it('does not add the API key to other hosts', () => {
    http.get('https://media.giphy.com/media/abc/giphy.gif').subscribe();

    const request = httpTesting.expectOne('https://media.giphy.com/media/abc/giphy.gif');
    expect(request.request.params.has('api_key')).toBe(false);
    request.flush({});
  });
});
