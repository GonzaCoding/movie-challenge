import { hydrateRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClientProvider, HydrationBoundary } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import type { DehydratedState } from '@tanstack/react-query';
import { createStore } from './redux/store';
import { loadState, throttledSaveState } from './redux/persistence';
import App from './App';
import './styles/reset.scss';
import { createQueryClient } from './queries/client';

// Create a client-side query client
const queryClient = createQueryClient();

// Load persisted state from localStorage
const store = createStore();
const persistedState = loadState();
if (persistedState) {
  store.dispatch({
    type: 'app/hydrate',
    payload: persistedState,
  });
}

// Subscribe to store changes and persist to localStorage
store.subscribe(() => {
  const state = store.getState();
  throttledSaveState(state.app);
});

declare global {
  interface Window {
    __DEHYDRATED_STATE__?: DehydratedState;
  }
}

// Get dehydrated state from window
const dehydratedState = window.__DEHYDRATED_STATE__;

hydrateRoot(
  document.getElementById('root')!,
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <BrowserRouter>
          <App url={undefined} />
        </BrowserRouter>
      </HydrationBoundary>
    </QueryClientProvider>
  </Provider>,
);
