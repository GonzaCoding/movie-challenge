/**
 * Generate TMDB poster URL with responsive sizing
 * Optimized with memoization for better performance
 */

// Memoization cache for poster URLs
const posterUrlCache = new Map<string, string>();

export function posterUrlForSize(
  path: string | null,
  size: 'mobile' | 'desktop' | 'thumb',
): string {
  // Return placeholder if no path provided
  if (!path) {
    return '/placeholder-movie-poster.svg';
  }

  // Create cache key
  const cacheKey = `${path}-${size}`;

  // Return cached result if available
  if (posterUrlCache.has(cacheKey)) {
    return posterUrlCache.get(cacheKey)!;
  }

  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // TMDB CDN base URL
  const baseUrl = 'https://image.tmdb.org/t/p/';

  // Size mapping - optimized for different use cases
  const sizeMap = {
    mobile: 'w185', // For mobile devices and small cards
    desktop: 'w342', // For desktop cards and medium displays
    thumb: 'w92', // For thumbnails and small previews
  };

  const url = `${baseUrl}${sizeMap[size]}/${cleanPath}`;

  // Cache the result
  posterUrlCache.set(cacheKey, url);

  return url;
}
