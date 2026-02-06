"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface RequestSkeletonProps {
  titleClassName?: string;
  blocks: string[];
}

export function RequestSkeleton({ titleClassName = "h-8 w-1/3", blocks }: RequestSkeletonProps) {
  return (
    <div className="space-y-6">
      <Skeleton className={titleClassName} />
      {blocks.map((className, index) => (
        <Skeleton key={`${className}-${index}`} className={className} />
      ))}
    </div>
  );
}
