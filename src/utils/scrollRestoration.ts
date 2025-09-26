/**
 * Scroll restoration utility for maintaining scroll positions when navigating
 */

interface ScrollPosition {
  scrollY: number;
  carouselScrolls: Record<string, number>;
}

interface ScrollStore {
  [pathname: string]: ScrollPosition;
}

class ScrollRestorationManager {
  private store: ScrollStore = {};
  private currentPath: string = '';

  /**
   * Save scroll position for current path
   */
  saveScrollPosition(pathname: string, carouselScrolls: Record<string, number> = {}) {
    this.currentPath = pathname;
    this.store[pathname] = {
      scrollY: window.scrollY,
      carouselScrolls,
    };
  }

  /**
   * Restore scroll position for given path
   */
  restoreScrollPosition(pathname: string): ScrollPosition | null {
    const position = this.store[pathname];
    if (position) {
      // Restore main scroll position
      window.scrollTo(0, position.scrollY);
      
      // Restore carousel scroll positions
      Object.entries(position.carouselScrolls).forEach(([carouselId, scrollLeft]) => {
        const carousel = document.querySelector(`[data-carousel-id="${carouselId}"]`);
        if (carousel) {
          carousel.scrollLeft = scrollLeft;
        }
      });
      
      return position;
    }
    return null;
  }

  /**
   * Clear scroll position for given path
   */
  clearScrollPosition(pathname: string) {
    delete this.store[pathname];
  }

  /**
   * Clear all scroll positions
   */
  clearAllScrollPositions() {
    this.store = {};
  }

  /**
   * Get current scroll position
   */
  getCurrentScrollPosition(): ScrollPosition | null {
    return this.store[this.currentPath] || null;
  }
}

// Export singleton instance
export const scrollRestoration = new ScrollRestorationManager();

/**
 * Hook for managing scroll restoration in components
 */
export const useScrollRestoration = (pathname: string) => {
  const savePosition = (carouselScrolls: Record<string, number> = {}) => {
    scrollRestoration.saveScrollPosition(pathname, carouselScrolls);
  };

  const restorePosition = () => {
    return scrollRestoration.restoreScrollPosition(pathname);
  };

  const clearPosition = () => {
    scrollRestoration.clearScrollPosition(pathname);
  };

  return {
    savePosition,
    restorePosition,
    clearPosition,
  };
};
