import { FileSizePipe } from './file-size-pipe';

describe('FileSizePipe', () => {
  const pipe = new FileSizePipe();

  it('returns "Unknown" for null', () => {
    expect(pipe.transform(null)).toBe('Unknown');
  });

  it('formats bytes', () => {
    expect(pipe.transform(0)).toBe('0 B');
    expect(pipe.transform(1023)).toBe('1023 B');
  });

  it('formats kilobytes', () => {
    expect(pipe.transform(1024)).toBe('1.0 KB');
    expect(pipe.transform(1536)).toBe('1.5 KB');
  });

  it('formats megabytes', () => {
    expect(pipe.transform(1024 * 1024)).toBe('1.0 MB');
    expect(pipe.transform(2.5 * 1024 * 1024)).toBe('2.5 MB');
  });
});
