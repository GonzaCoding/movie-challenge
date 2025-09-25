import { render } from '@testing-library/react';
import { CardSkeleton, RowSkeleton } from '../../src/components/Skeleton';

describe('Skeleton Components', () => {
  describe('CardSkeleton', () => {
    it('should render with default className', () => {
      const { container } = render(<CardSkeleton />);
      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('skeleton', 'skeleton--card');
    });

    it('should render with custom className', () => {
      const { container } = render(<CardSkeleton className="custom-class" />);
      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('skeleton', 'skeleton--card', 'custom-class');
    });
  });

  describe('RowSkeleton', () => {
    it('should render with default count', () => {
      const { container } = render(<RowSkeleton />);
      const skeletons = container.querySelectorAll('.skeleton--card');
      expect(skeletons).toHaveLength(5); // default count
    });

    it('should render with custom count', () => {
      const { container } = render(<RowSkeleton count={3} />);
      const skeletons = container.querySelectorAll('.skeleton--card');
      expect(skeletons).toHaveLength(3);
    });

    it('should render with custom className', () => {
      const { container } = render(<RowSkeleton className="custom-row" />);
      const row = container.firstChild;
      expect(row).toHaveClass('skeleton--row', 'custom-row');
    });
  });
});
