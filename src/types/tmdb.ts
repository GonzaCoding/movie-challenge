export type Category = 'popular' | 'top_rated' | 'upcoming';

export interface MovieSummary {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
}

export interface MovieDetail {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
}

export interface PagedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface WishlistItem {
  id: number;
  title: string;
  poster_path: string | null;
  category?: Category;
}

export interface AppState {
  wishlist: Record<number, WishlistItem>;
  ui: {
    isWishlistOpen: boolean;
  };
}
