import { hydrateRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider, HydrationBoundary } from '@tanstack/react-query';
import { store } from '@redux/store';
import { loadState, throttledSaveState } from '@redux/persistence';
import App from './App';
import './styles/reset.scss';

// Create a client-side query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 0,
    },
  },
});

// Load persisted state from localStorage
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

// Get dehydrated state from window
const dehydratedState = (window as { __DEHYDRATED_STATE__?: unknown }).__DEHYDRATED_STATE__;

hydrateRoot(
  document.getElementById('root')!,
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>
        <App />
      </HydrationBoundary>
    </QueryClientProvider>
  </Provider>,
);
