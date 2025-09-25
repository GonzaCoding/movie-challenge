import './Skeleton.scss';

interface CardSkeletonProps {
  className?: string;
}

export default function CardSkeleton({ className = '' }: CardSkeletonProps) {
  return (
    <div className={`skeleton skeleton--card ${className}`.trim()}>
      {/* Empty div for the shimmer effect */}
    </div>
  );
}
