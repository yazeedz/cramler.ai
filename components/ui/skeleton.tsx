import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/60",
        className
      )}
    />
  )
}

export function ImageSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Skeleton className="absolute inset-0" />
    </div>
  );
}
