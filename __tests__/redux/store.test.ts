import '@testing-library/jest-dom';
import { createStore } from '../../src/redux/store';
import { getDefaultAppState } from '../../src/redux/appSlice';
import type { AppState } from '../../src/types/tmdb';

describe('Store', () => {
  it('should create a store with default state', () => {
    const store = createStore();
    const state = store.getState();

    expect(state).toHaveProperty('app');
    expect(state.app).toEqual(getDefaultAppState());
  });

  it('should have correct initial app state', () => {
    const store = createStore();
    const state = store.getState();

    expect(state.app.wishlist).toEqual({});
    expect(state.app.ui.isWishlistOpen).toBe(false);
  });

  it('should create a new store instance each time', () => {
    const store1 = createStore();
    const store2 = createStore();

    expect(store1).not.toBe(store2);
    expect(store1.getState()).toEqual(store2.getState());
  });

  it('should have proper store structure', () => {
    const store = createStore();
    const state = store.getState();

    expect(state).toHaveProperty('app');
    expect(state.app).toHaveProperty('wishlist');
    expect(state.app).toHaveProperty('ui');
    expect(state.app.ui).toHaveProperty('isWishlistOpen');
  });

  it('should be able to dispatch actions', () => {
    const store = createStore();
    const initialState = store.getState();

    // Dispatch a simple action to test the store works
    store.dispatch({
      type: 'app/toggleWishlistItem',
      payload: { id: 1, title: 'Test', poster_path: '/test.jpg' },
    });

    const newState = store.getState();
    expect(newState).not.toEqual(initialState);
    expect(newState.app.wishlist).toHaveProperty('1');
  });

  it('should have proper TypeScript types', () => {
    const store = createStore();

    // Test that the store has the correct type structure
    const state: AppState = store.getState().app;
    expect(typeof state.wishlist).toBe('object');
    expect(typeof state.ui.isWishlistOpen).toBe('boolean');
  });
});
