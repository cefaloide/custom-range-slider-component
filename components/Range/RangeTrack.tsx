"use client";

import React from "react";

interface RangeTrackProps {
  leftPercent: number;
  rightPercent: number;
  children: React.ReactNode;
  onTrackPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  trackRef: React.RefObject<HTMLDivElement | null>;
}

export function RangeTrack({
  leftPercent,
  rightPercent,
  children,
  onTrackPointerDown,
  trackRef,
}: RangeTrackProps) {
  const widthPercent = Math.max(0, rightPercent - leftPercent);

  return (
    <div
      ref={trackRef}
      onPointerDown={onTrackPointerDown}
      className={`relative w-full h-8 flex items-center select-none cursor-pointer`}
    >
      {/* Background Track Line */}
      <div className="relative w-full h-[2.5px] bg-neutral-300 rounded-full">
        {/* Selected Active Range Line (Solid Black) */}
        <div
          data-testid="range-highlight"
          className="absolute top-0 bottom-0 bg-black rounded-full transition-[left,width] duration-75"
          style={{
            left: `${leftPercent}%`,
            width: `${widthPercent}%`,
          }}
        />
      </div>

      {/* Handles layer */}
      {children}
    </div>
  );
}
