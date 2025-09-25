import CardSkeleton from './CardSkeleton';

interface RowSkeletonProps {
  count?: number;
  className?: string;
}

export default function RowSkeleton({ count = 5, className = '' }: RowSkeletonProps) {
  return (
    <div className={`skeleton--row ${className}`.trim()}>
      {Array.from({ length: count }, (_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}
