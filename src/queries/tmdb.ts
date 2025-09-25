import type { Category, MovieSummary, MovieDetail, PagedResponse } from '../types/tmdb';

// Get API key from environment
const getApiKey = () => {
  // In browser/Vite environment
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_TMDB_API_KEY || 'test_api_key';
  }
  // In Node.js/Jest environment
  return process.env.VITE_TMDB_API_KEY || 'test_api_key';
};

const API_KEY = getApiKey();

// Determine base URL based on environment
const getBaseUrl = () => {
  // In browser/Vite environment (client-side)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return window.location.origin + '/api'; // Use Vite proxy with full URL
  }
  // In Node.js/Jest environment (server-side)
  return 'https://api.themoviedb.org/3';
};

/**
 * Base fetch utility for TMDB API
 */
async function api<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = new URL(`${baseUrl}${path}`);
  url.searchParams.set('api_key', API_KEY);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.status_message || `TMDB API error: ${response.status} ${response.statusText}`,
    );
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
