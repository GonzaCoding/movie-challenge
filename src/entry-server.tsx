import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { QueryClientProvider, dehydrate } from '@tanstack/react-query';
import { StaticRouter } from 'react-router-dom';
import { createStore } from './redux/store';
import App from './App';
import { createQueryClient } from './queries/client';
import { fetchPopular, fetchMovieDetail, moviesKey, movieKey } from './queries/tmdb';
import type { MovieDetail } from './types/tmdb';

export async function render(url: string) {
  const store = createStore();
  const queryClient = createQueryClient();
  let headTags = '';

  // Prefetch popular movies data for the home page
  if (url === '/') {
    try {
      await queryClient.prefetchInfiniteQuery({
        queryKey: moviesKey('popular'),
        queryFn: ({ pageParam = 1 }) => fetchPopular(pageParam),
        getNextPageParam: (lastPage: any) =>
          lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
        initialPageParam: 1,
      });
    } catch (error) {
      console.error('Failed to prefetch popular movies:', error);
    }
  }

  // Prefetch movie detail data for movie detail pages
  const movieDetailMatch = url.match(/^\/movie\/(\d+)$/);
  if (movieDetailMatch) {
    const movieId = parseInt(movieDetailMatch[1], 10);
    try {
      const movie = (await queryClient.prefetchQuery({
        queryKey: movieKey(movieId),
        queryFn: () => fetchMovieDetail(movieId),
      })) as MovieDetail | undefined;

      // Generate SEO tags for movie detail page
      if (movie) {
        const movieData = movie as MovieDetail;
        const truncatedOverview = movieData.overview
          ? movieData.overview.length > 160
            ? movieData.overview.substring(0, 157) + '...'
            : movieData.overview
          : '';

        const posterUrl = movieData.poster_path
          ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
          : '';

        headTags = `<title>${movieData.title} — Movie Details</title>
<meta name="description" content="${truncatedOverview}">
<meta property="og:title" content="${movieData.title} — Movie Details">
<meta property="og:description" content="${truncatedOverview}">
<meta property="og:type" content="video.movie">
${posterUrl ? `<meta property="og:image" content="${posterUrl}">` : ''}
<meta property="og:url" content="${url}">`;
      }
    } catch (error) {
      console.error('Failed to prefetch movie detail:', error);
    }
  }

  const html = renderToString(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </QueryClientProvider>
    </Provider>,
  );

  const dehydratedState = dehydrate(queryClient);

  return {
    html,
    headTags,
    dehydratedState,
  };
}
