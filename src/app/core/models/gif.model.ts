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
