import './Carousel.scss';
import { useCarousel } from './useCarousel';
import { forwardRef } from 'react';

interface CarouselProps {
  children: React.ReactNode[];
  onEndReached?: () => void;
  'data-carousel-id'?: string;
}

const Carousel = forwardRef<HTMLDivElement, CarouselProps>(({ children, onEndReached, ...props }, ref) => {
  const { trackRef, endSentinelRef, scrollPrev, scrollNext } = useCarousel(onEndReached);

  return (
    <div className="carousel" ref={ref} {...props}>
      <button
        className="carousel__arrow carousel__arrow--left"
        onClick={scrollPrev}
        aria-label="Previous movies"
        type="button"
      >
        ‹
      </button>

      <div className="carousel__track" ref={trackRef}>
        {children}
        {onEndReached && <div ref={endSentinelRef} className="carousel__sentinel" />}
      </div>

      <button
        className="carousel__arrow carousel__arrow--right"
        onClick={scrollNext}
        aria-label="Next movies"
        type="button"
      >
        ›
      </button>
    </div>
  );
});

Carousel.displayName = 'Carousel';

export default Carousel;
