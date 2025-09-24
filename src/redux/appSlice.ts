import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AppState, WishlistItem } from '../types/tmdb';

const initialState: AppState = {
  wishlist: {},
  ui: {
    isWishlistOpen: false,
  },
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    toggleWishlistItem: (state, action: PayloadAction<WishlistItem>) => {
      const item = action.payload;
      if (state.wishlist[item.id]) {
        delete state.wishlist[item.id];
      } else {
        state.wishlist[item.id] = item;
      }
    },
    removeWishlistItem: (state, action: PayloadAction<number>) => {
      delete state.wishlist[action.payload];
    },
    openWishlist: (state) => {
      state.ui.isWishlistOpen = true;
    },
    closeWishlist: (state) => {
      state.ui.isWishlistOpen = false;
    },
    hydrate: (state, action: PayloadAction<Partial<AppState>>) => {
      if (action.payload.wishlist) {
        state.wishlist = action.payload.wishlist;
      }
    },
  },
});

export const { toggleWishlistItem, removeWishlistItem, openWishlist, closeWishlist, hydrate } =
  appSlice.actions;

export const getDefaultAppState = (): AppState =>
  appSlice.reducer(undefined, { type: '@@redux/INIT' });

export default appSlice.reducer;
