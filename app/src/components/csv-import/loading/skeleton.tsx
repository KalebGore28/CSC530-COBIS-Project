"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";


/**
 * Props for the SkeletonCard component
 */
interface SkeletonCardProps {
  /** Whether to show a title skeleton */
  showTitle?: boolean;
  /** Whether to show a description skeleton */
  showDescription?: boolean;
  /** Number of content lines to show */
  lines?: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show a dropdown skeleton (default: false) */
  showDropdown?: boolean;
}

/**
 * A skeleton card loader component that matches your card layout pattern
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showTitle = true,
  showDescription = true,
  lines = 1,
  className,
  showDropdown = false,
}) => {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        {showTitle && <Skeleton className="h-4 w-1/2" />}
        {showDescription && <Skeleton className="h-3 w-1/3 mt-2" />}
      </CardHeader>
      <CardContent className="space-y-2">
        {showDropdown && <Skeleton className="h-10 w-full" />}
        {Array(lines).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </CardContent>
    </Card>
  );
};

/**
 * Props for the ContentSkeleton component
 */
interface ContentSkeletonProps {
  /** Number of rows to display */
  rows?: number;
  /** Width of each row as a percentage string (e.g., "100%", "75%") */
  widths?: string[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * A simple content skeleton for inline loading states
 */
export const ContentSkeleton: React.FC<ContentSkeletonProps> = ({
  rows = 3,
  widths = ["100%", "80%", "60%"],
  className,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {Array(rows).fill(0).map((_, i) => (
        <Skeleton 
          key={i} 
          className="h-4" 
          style={{ width: widths[i % widths.length] }}
        />
      ))}
    </div>
  );
};

/**
 * Props for the SelectSkeleton component
 */
interface SelectSkeletonProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * A skeleton for select dropdowns
 */
export const SelectSkeleton: React.FC<SelectSkeletonProps> = ({
  className,
}) => {
  return (
    <Skeleton className={cn("h-10 w-full", className)} />
  );
};