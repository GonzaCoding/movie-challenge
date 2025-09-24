import { AppState } from '../types/tmdb';

const STORAGE_KEY = 'movie-browser-app';

export const loadState = (): Partial<AppState> | undefined => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.warn('Failed to load state from localStorage:', err);
    return undefined;
  }
};

export const saveState = (state: AppState): void => {
  try {
    // Only persist the wishlist, not UI state
    const stateToSave = {
      wishlist: state.wishlist,
    };
    const serializedState = JSON.stringify(stateToSave);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.warn('Failed to save state to localStorage:', err);
  }
};

// Throttle save operations to avoid excessive localStorage writes
let saveTimeout: NodeJS.Timeout | null = null;

export const throttledSaveState = (state: AppState): void => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(() => {
    saveState(state);
  }, 500);
};
