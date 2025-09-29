import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { QueryClientProvider, dehydrate } from '@tanstack/react-query';
import { StaticRouter } from 'react-router-dom/server';
import { createStore } from './redux/store';
import App from './App';
import { createQueryClient } from './queries/client';
import { fetchPopular, fetchMovieDetail, moviesKey, movieKey } from './queries/tmdb';
import type { MovieDetail } from './types/tmdb';
import { stripHtmlTags, truncate } from './utils/text';

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const escapeHtmlAttribute = (value: string): string =>
  escapeHtml(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export async function render(url: string) {
  const store = createStore();
  const queryClient = createQueryClient();

  const headTagSegments: string[] = [];

  const pushHeadTag = (tag: string) => {
    if (tag) {
      headTagSegments.push(tag.trim());
    }
  };

  const pushDefaultSeo = () => {
    const baseTitle = 'Movie Browser — Popular, Top Rated, Upcoming';
    pushHeadTag(`<title>${escapeHtml(baseTitle)}</title>`);
    pushHeadTag(
      '<meta name="description" content="Browse popular, top-rated, and upcoming movies powered by TMDB.">',
    );
    pushHeadTag('<meta property="og:title" content="Movie Browser">');
    pushHeadTag(
      '<meta property="og:description" content="Discover trending films with server-rendered previews and wishlists.">',
    );
    pushHeadTag('<meta property="og:type" content="website">');
    pushHeadTag('<meta property="og:url" content="/">');
  };

  pushHeadTag('<meta charset="utf-8">');
  pushHeadTag('<meta http-equiv="X-UA-Compatible" content="IE=edge">');

  if (url === '/') {
    pushDefaultSeo();
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
  } else {
    pushDefaultSeo();
  }

  const movieDetailMatch = url.match(/^\/movie\/(\d+)$/);
  if (movieDetailMatch) {
    const movieId = Number.parseInt(movieDetailMatch[1], 10);
    try {
      const movie = (await queryClient.prefetchQuery({
        queryKey: movieKey(movieId),
        queryFn: () => fetchMovieDetail(movieId),
      })) as MovieDetail | undefined;

      if (movie) {
        const truncatedOverview = truncate(stripHtmlTags(movie.overview ?? ''), 160);
        const posterUrl = movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : '';
        const pageTitle = `${movie.title} — Movie Details`;

        pushHeadTag(`<title>${escapeHtml(pageTitle)}</title>`);
        pushHeadTag(
          `<meta name="description" content="${escapeHtmlAttribute(truncatedOverview)}">`,
        );
        pushHeadTag(`<meta property="og:title" content="${escapeHtmlAttribute(pageTitle)}">`);
        pushHeadTag(
          `<meta property="og:description" content="${escapeHtmlAttribute(truncatedOverview)}">`,
        );
        pushHeadTag('<meta property="og:type" content="video.movie">');
        if (posterUrl) {
          pushHeadTag(`<meta property="og:image" content="${escapeHtmlAttribute(posterUrl)}">`);
        }
        pushHeadTag(`<meta property="og:url" content="${escapeHtmlAttribute(url)}">`);
      }
    } catch (error) {
      console.error('Failed to prefetch movie detail:', error);
    }
  }

  const appHtml = renderToString(
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
    html: appHtml,
    headTags: headTagSegments.join('\n'),
    dehydratedState,
  };
}
