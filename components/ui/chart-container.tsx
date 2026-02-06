"use client";

import { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { useElementSize } from "@/lib/hooks";

interface ChartContainerProps {
  className?: string;
  debounceMs?: number;
  children: (size: { width: number; height: number }) => ReactNode;
}

export function ChartContainer({ className, debounceMs = 80, children }: ChartContainerProps) {
  const { ref, size } = useElementSize<HTMLDivElement>({ debounceMs });

  return (
    <div ref={ref} className={cn("h-full w-full min-w-0", className)}>
      {size.width > 0 && size.height > 0 ? children(size) : null}
    </div>
  );
}
