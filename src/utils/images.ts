/**
 * Generate TMDB poster URL with responsive sizing
 */
export function posterUrlForSize(path: string | null, size: 'mobile' | 'desktop'): string {
  // Return placeholder if no path provided
  if (!path) {
    return '/placeholder-movie-poster.svg';
  }

  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // TMDB CDN base URL
  const baseUrl = 'https://image.tmdb.org/t/p/';

  // Size mapping
  const sizeMap = {
    mobile: 'w185',
    desktop: 'w342', // Could also use 'w500' for higher quality
  };

  return `${baseUrl}${sizeMap[size]}/${cleanPath}`;
}
