import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider, dehydrate } from '@tanstack/react-query';
import { configureStore } from '@reduxjs/toolkit';
import App from './App';

export async function render(url: string) {
  // Create a per-request Redux store
  const store = configureStore({
    reducer: {
      app: (state = { wishlist: {}, ui: { isWishlistOpen: false } }) => state,
    },
  });

  // Create a per-request QueryClient
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 0,
      },
    },
  });

  // Render the app with StaticRouter for SSR
  const html = renderToString(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App url={url} />
      </QueryClientProvider>
    </Provider>,
  );

  // Dehydrate the query client state
  const dehydratedState = dehydrate(queryClient);

  return {
    html,
    headTags: '',
    dehydratedState,
  };
}
