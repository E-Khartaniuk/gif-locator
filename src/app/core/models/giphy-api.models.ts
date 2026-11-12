export interface GiphyImageDto {
  url: string;
  width: string;
  height: string;
  size?: string;
  mp4?: string;
  webp?: string;
}

export interface GiphyUserDto {
  username: string;
  display_name: string;
  avatar_url: string;
  profile_url: string;
}

export interface GiphyGifDto {
  id: string;
  title: string;
  url: string;
  username: string;
  source: string;
  rating: string;
  import_datetime: string;
  alt_text?: string;
  user?: GiphyUserDto;
  images: {
    original: GiphyImageDto;
    fixed_width: GiphyImageDto;
  };
}

export interface GiphyPaginationDto {
  total_count: number;
  count: number;
  offset: number;
}

export interface GiphyListResponseDto {
  data: GiphyGifDto[];
  pagination: GiphyPaginationDto;
}

export interface GiphyGifResponseDto {
  data: GiphyGifDto;
}
