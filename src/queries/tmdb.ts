import type { Category, MovieSummary, MovieDetail, PagedResponse } from '../types/tmdb';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Get API key from environment
const API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'test_api_key';

/**
 * Base fetch utility for TMDB API
 */
async function api<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set('api_key', API_KEY);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetch popular movies
 */
export async function fetchPopular(page: number = 1): Promise<PagedResponse<MovieSummary>> {
  return api<PagedResponse<MovieSummary>>('/movie/popular', { page });
}

/**
 * Fetch top rated movies
 */
export async function fetchTopRated(page: number = 1): Promise<PagedResponse<MovieSummary>> {
  return api<PagedResponse<MovieSummary>>('/movie/top_rated', { page });
}

/**
 * Fetch upcoming movies
 */
export async function fetchUpcoming(page: number = 1): Promise<PagedResponse<MovieSummary>> {
  return api<PagedResponse<MovieSummary>>('/movie/upcoming', { page });
}

/**
 * Fetch movie details by ID
 */
export async function fetchMovieDetail(id: number): Promise<MovieDetail> {
  return api<MovieDetail>(`/movie/${id}`);
}

/**
 * Query key helpers for TanStack Query
 */
export function moviesKey(category: Category, page?: number): [string, Category, number] {
  return ['movies', category, page ?? 1];
}

export function movieKey(id: number): [string, number] {
  return ['movie', id];
}
