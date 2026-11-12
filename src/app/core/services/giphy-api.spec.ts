import { TestBed } from '@angular/core/testing';
import { GiphyApi } from './giphy-api';

describe('GiphyApi', () => {
  let service: GiphyApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GiphyApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
