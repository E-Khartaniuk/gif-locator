import { TestBed } from '@angular/core/testing';
import { GifDownloader } from './gif-downloader';

describe('GifDownloader', () => {
  let service: GifDownloader;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GifDownloader);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
