import { hydrateRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider, HydrationBoundary } from '@tanstack/react-query';
import { configureStore } from '@reduxjs/toolkit';
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

// Create a client-side store
const store = configureStore({
  reducer: {
    app: (state = { wishlist: {}, ui: { isWishlistOpen: false } }) => state,
  },
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
