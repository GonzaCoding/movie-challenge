import { configureStore } from '@reduxjs/toolkit';
import appReducer, {
  toggleWishlistItem,
  removeWishlistItem,
  openWishlist,
  closeWishlist,
  hydrate,
  getDefaultAppState,
} from '../../src/redux/appSlice';
import type { WishlistItem } from '../../src/types/tmdb';

describe('appSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        app: appReducer,
      },
    });
  });

  it('should have initial state', () => {
    const state = (store.getState() as any).app;
    expect(state.wishlist).toEqual({});
    expect(state.ui.isWishlistOpen).toBe(false);
  });

  it('should toggle wishlist item', () => {
    const item: WishlistItem = {
      id: 1,
      title: 'Test Movie',
      poster_path: '/test.jpg',
      category: 'popular',
    };

    store.dispatch(toggleWishlistItem(item));
    let state = (store.getState() as any).app;
    expect(state.wishlist[1]).toEqual(item);

    store.dispatch(toggleWishlistItem(item));
    state = (store.getState() as any).app;
    expect(state.wishlist[1]).toBeUndefined();
  });

  it('should remove wishlist item', () => {
    const item: WishlistItem = {
      id: 1,
      title: 'Test Movie',
      poster_path: '/test.jpg',
    };

    store.dispatch(toggleWishlistItem(item));
    store.dispatch(removeWishlistItem(1));

    const state = (store.getState() as any).app;
    expect(state.wishlist[1]).toBeUndefined();
  });

  it('should open and close wishlist', () => {
    store.dispatch(openWishlist());
    let state = (store.getState() as any).app;
    expect(state.ui.isWishlistOpen).toBe(true);

    store.dispatch(closeWishlist());
    state = (store.getState() as any).app;
    expect(state.ui.isWishlistOpen).toBe(false);
  });

  it('should hydrate state', () => {
    const hydratedState = {
      wishlist: {
        1: { id: 1, title: 'Test', poster_path: '/test.jpg' },
      },
    };

    store.dispatch(hydrate(hydratedState));
    const state = (store.getState() as any).app;
    expect(state.wishlist).toEqual(hydratedState.wishlist);
  });

  it('should return default app state', () => {
    const defaultState = getDefaultAppState();
    expect(defaultState.wishlist).toEqual({});
    expect(defaultState.ui.isWishlistOpen).toBe(false);
  });
});
