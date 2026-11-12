export const GIF_RATINGS = ['g', 'pg', 'pg-13', 'r'] as const;
export type GifRating = (typeof GIF_RATINGS)[number];
export const DEFAULT_GIF_RATING: GifRating = 'g';

export function isGifRating(value: string | null): value is GifRating {
  return GIF_RATINGS.includes(value as GifRating);
}

export interface GifAuthor {
  username: string;
  displayName: string;
  avatarUrl: string;
  profileUrl: string;
}

export interface Gif {
  id: string;
  title: string;
  pageUrl: string;
  previewUrl: string;
  originalUrl: string;
  width: number;
  height: number;
  sizeBytes: number | null;
  rating: string;
  source: string;
  createdAt: Date | null;
  author: GifAuthor | null;
}

export interface GifPage {
  items: Gif[];
  totalCount: number;
  offset: number;
}
