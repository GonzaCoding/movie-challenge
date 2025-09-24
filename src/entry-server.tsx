import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider, dehydrate } from '@tanstack/react-query';
import { store } from '@redux/store';
import App from './App';

export async function render(url: string) {
  // Use the shared store configuration

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
