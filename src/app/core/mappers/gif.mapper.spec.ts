import { GiphyGifDto } from '../models/giphy-api.models';
import { toGif, toGifPage } from './gif.mapper';

function createGifDto(overrides: Partial<GiphyGifDto> = {}): GiphyGifDto {
  return {
    id: 'abc123',
    title: 'Happy Cat GIF',
    url: 'https://giphy.com/gifs/abc123',
    username: 'catlover',
    source: 'https://example.com',
    rating: 'g',
    import_datetime: '2021-05-10 14:30:00',
    user: {
      username: 'catlover',
      display_name: 'Cat Lover',
      avatar_url: 'https://media.giphy.com/avatar.gif',
      profile_url: 'https://giphy.com/catlover',
    },
    images: {
      original: {
        url: 'https://media.giphy.com/original.gif',
        width: '480',
        height: '270',
        size: '1048576',
      },
      fixed_width: {
        url: 'https://media.giphy.com/200w.gif',
        width: '200',
        height: '113',
      },
    },
    ...overrides,
  };
}

describe('gif mapper', () => {
  describe('toGif', () => {
    it('maps a Giphy DTO to the app model', () => {
      const gif = toGif(createGifDto());

      expect(gif).toEqual({
        id: 'abc123',
        title: 'Happy Cat GIF',
        pageUrl: 'https://giphy.com/gifs/abc123',
        previewUrl: 'https://media.giphy.com/200w.gif',
        originalUrl: 'https://media.giphy.com/original.gif',
        width: 480,
        height: 270,
        sizeBytes: 1048576,
        rating: 'g',
        source: 'https://example.com',
        createdAt: new Date('2021-05-10T14:30:00Z'),
        author: {
          username: 'catlover',
          displayName: 'Cat Lover',
          avatarUrl: 'https://media.giphy.com/avatar.gif',
          profileUrl: 'https://giphy.com/catlover',
        },
      });
    });

    it('returns null author when the GIF has no user', () => {
      expect(toGif(createGifDto({ user: undefined })).author).toBeNull();
    });

    it('falls back to the username when the display name is empty', () => {
      const dto = createGifDto();
      dto.user!.display_name = '';

      expect(toGif(dto).author?.displayName).toBe('catlover');
    });

    it('uses a placeholder title when the title is empty', () => {
      expect(toGif(createGifDto({ title: '' })).title).toBe('Untitled');
    });

    it('returns null date for the Giphy zero date', () => {
      expect(toGif(createGifDto({ import_datetime: '0000-00-00 00:00:00' })).createdAt).toBeNull();
    });

    it('returns null date for an invalid date string', () => {
      expect(toGif(createGifDto({ import_datetime: 'not a date' })).createdAt).toBeNull();
    });

    it('returns null size when the size is missing', () => {
      const dto = createGifDto();
      delete dto.images.original.size;

      expect(toGif(dto).sizeBytes).toBeNull();
    });
  });

  describe('toGifPage', () => {
    it('maps items and pagination', () => {
      const page = toGifPage({
        data: [createGifDto({ id: 'a' }), createGifDto({ id: 'b' })],
        pagination: { total_count: 120, count: 2, offset: 40 },
      });

      expect(page.items.map((gif) => gif.id)).toEqual(['a', 'b']);
      expect(page.totalCount).toBe(120);
      expect(page.offset).toBe(40);
    });
  });
});
