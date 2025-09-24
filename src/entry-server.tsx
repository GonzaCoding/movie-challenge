import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider, dehydrate } from '@tanstack/react-query';
import { createStore } from './redux/store';
import App from './App';

export async function render(url: string) {
  const store = createStore();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 0,
      },
    },
  });

  const html = renderToString(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App url={url} />
      </QueryClientProvider>
    </Provider>,
  );

  const dehydratedState = dehydrate(queryClient);

  return {
    html,
    headTags: '',
    dehydratedState,
  };
}
