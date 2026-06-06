"use client";

import React from "react";

type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`bg-[#E8E8E8] rounded-md animate-pulse ${className}`} style={{ animationDuration: '1.2s' }}>
      <div className="w-full h-full bg-gradient-to-r from-transparent via-[#F5F5F5] to-transparent bg-[length:200%_100%] animate-shimmer opacity-60" />
    </div>
  );
}

// 6.7 Horizontal Food Card Skeleton
export function HorizontalFoodCardSkeleton() {
  return (
    <div className="py-4 flex gap-4 w-full bg-white relative border-b border-[#F2F2F2]">
      <div className="flex-1 min-w-0 flex flex-col justify-start">
        <Skeleton className="w-4 h-4 rounded-sm mb-2" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/4 mb-3" />
        <Skeleton className="h-3 w-full mb-1" />
        <Skeleton className="h-3 w-5/6" />
      </div>
      <div className="w-[130px] shrink-0 relative flex flex-col items-center">
        <Skeleton className="w-full h-[120px] rounded-[12px]" />
        <div className="absolute -bottom-3 w-[96px] h-[32px]">
          <Skeleton className="w-full h-full rounded-[8px]" />
        </div>
      </div>
    </div>
  );
}

// 6.8 Vertical Restaurant/Food Card Skeleton
export function VerticalCardSkeleton() {
  return (
    <div className="w-[160px] shrink-0 bg-white border border-[#E8E8E8] rounded-[12px] flex flex-col overflow-hidden">
      <Skeleton className="w-full h-[120px] rounded-none" />
      <div className="p-3 flex flex-col flex-1">
        <div className="flex gap-1.5 mb-2">
           <Skeleton className="w-4 h-4 rounded-sm" />
           <Skeleton className="h-4 w-full" />
        </div>
        <div className="mt-auto">
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}

// 7.3 Tiffin Plan Card Skeleton
export function TiffinPlanCardSkeleton() {
  return (
    <div className="w-[200px] shrink-0 bg-white border border-[#E8E8E8] rounded-[16px] flex flex-col overflow-hidden">
      <Skeleton className="w-full h-[120px] rounded-none" />
      <div className="p-3 flex flex-col flex-1">
        <div className="flex gap-1.5 mb-3">
           <Skeleton className="w-4 h-4 rounded-sm shrink-0" />
           <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-3 w-full mb-1" />
        <Skeleton className="h-3 w-4/5 mb-4" />
        <Skeleton className="h-5 w-1/2 mb-3" />
        <Skeleton className="w-full h-[40px] rounded-[999px] mt-auto" />
      </div>
    </div>
  );
}
