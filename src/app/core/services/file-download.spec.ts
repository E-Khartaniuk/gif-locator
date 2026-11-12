import { TestBed } from '@angular/core/testing';
import { FileDownload } from './file-download';

describe('FileDownload', () => {
  let service: FileDownload;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileDownload);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
