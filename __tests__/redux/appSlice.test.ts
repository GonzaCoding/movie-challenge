import appReducer, {
  toggleWishlistItem,
  removeWishlistItem,
  openWishlist,
  closeWishlist,
} from '../../src/redux/appSlice';
import { WishlistItem } from '../../src/types/tmdb';

describe('appSlice', () => {
  const mockMovie: WishlistItem = {
    id: 1,
    title: 'Test Movie',
    poster_path: '/test.jpg',
    category: 'popular',
  };

  it('should handle toggleWishlistItem - add item', () => {
    const initialState = { wishlist: {}, ui: { isWishlistOpen: false } };
    const action = toggleWishlistItem(mockMovie);
    const newState = appReducer(initialState, action);

    expect(newState.wishlist[1]).toEqual(mockMovie);
  });

  it('should handle toggleWishlistItem - remove item', () => {
    const initialState = {
      wishlist: { 1: mockMovie },
      ui: { isWishlistOpen: false },
    };
    const action = toggleWishlistItem(mockMovie);
    const newState = appReducer(initialState, action);

    expect(newState.wishlist[1]).toBeUndefined();
  });

  it('should handle removeWishlistItem', () => {
    const initialState = {
      wishlist: { 1: mockMovie },
      ui: { isWishlistOpen: false },
    };
    const action = removeWishlistItem(1);
    const newState = appReducer(initialState, action);

    expect(newState.wishlist[1]).toBeUndefined();
  });

  it('should handle openWishlist', () => {
    const initialState = { wishlist: {}, ui: { isWishlistOpen: false } };
    const action = openWishlist();
    const newState = appReducer(initialState, action);

    expect(newState.ui.isWishlistOpen).toBe(true);
  });

  it('should handle closeWishlist', () => {
    const initialState = { wishlist: {}, ui: { isWishlistOpen: true } };
    const action = closeWishlist();
    const newState = appReducer(initialState, action);

    expect(newState.ui.isWishlistOpen).toBe(false);
  });
});
