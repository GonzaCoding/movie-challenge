import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { QueryClientProvider, dehydrate } from '@tanstack/react-query';
import { StaticRouter } from 'react-router-dom';
import { createStore } from './redux/store';
import App from './App';
import { createQueryClient } from './queries/client';
import { fetchPopular, moviesKey } from './queries/tmdb';

export async function render(url: string) {
  const store = createStore();
  const queryClient = createQueryClient();

  // Prefetch popular movies data for the home page
  if (url === '/') {
    try {
      await queryClient.prefetchInfiniteQuery({
        queryKey: moviesKey('popular'),
        queryFn: ({ pageParam = 1 }) => fetchPopular(pageParam),
        getNextPageParam: (lastPage) =>
          lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
        initialPageParam: 1,
      });
    } catch (error) {
      console.error('Failed to prefetch popular movies:', error);
    }
  }

  const html = renderToString(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <StaticRouter location={url}>
          <App url={url} />
        </StaticRouter>
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
