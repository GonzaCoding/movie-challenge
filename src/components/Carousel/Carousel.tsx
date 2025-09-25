import './Carousel.scss';
import { useCarousel } from './useCarousel';

interface CarouselProps {
  children: React.ReactNode[];
  onEndReached?: () => void;
}

export default function Carousel({ children, onEndReached }: CarouselProps) {
  const { trackRef, endSentinelRef, scrollPrev, scrollNext } = useCarousel(onEndReached);

  return (
    <div className="carousel">
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
}
