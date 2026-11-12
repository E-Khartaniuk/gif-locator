import { GiphyGifDto, GiphyListResponseDto } from '../models/giphy-api.models';
import { Gif, GifPage } from '../models/gif.model';

function parseGiphyDate(value: string | undefined): Date | null {
  if (!value || value.startsWith('0000')) return null;
  const date = new Date(value.replace(' ', 'T') + 'Z');
  return isNaN(date.getTime()) ? null : date;
}

export function toGif(dto: GiphyGifDto): Gif {
  const original = dto.images.original;
  return {
    id: dto.id,
    title: dto.title || 'Untitled',
    pageUrl: dto.url,
    previewUrl: dto.images.fixed_width.url,
    originalUrl: original.url,
    width: Number(original.width),
    height: Number(original.height),
    sizeBytes: original.size ? Number(original.size) : null,
    rating: dto.rating,
    source: dto.source,
    createdAt: parseGiphyDate(dto.import_datetime),
    author: dto.user
      ? {
          username: dto.user.username,
          displayName: dto.user.display_name || dto.user.username,
          avatarUrl: dto.user.avatar_url,
          profileUrl: dto.user.profile_url,
        }
      : null,
  };
}

export function toGifPage(response: GiphyListResponseDto): GifPage {
  return {
    items: response.data.map(toGif),
    totalCount: response.pagination.total_count,
    offset: response.pagination.offset,
  };
}