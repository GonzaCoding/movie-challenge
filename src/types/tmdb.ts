export type Category = 'popular' | 'top_rated' | 'upcoming';

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
