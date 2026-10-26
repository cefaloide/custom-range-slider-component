import React from "react";

interface RangeHandleProps {
  positionPercent: number;
  value: number;
  minValue: number;
  maxValue: number;
  isDragging: boolean;
  ariaLabel: string;
  testId?: string;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export function RangeHandle({
  positionPercent,
  value,
  minValue,
  maxValue,
  isDragging,
  ariaLabel,
  testId,
  onPointerDown,
  onKeyDown,
}: RangeHandleProps) {
  return (
    <div
      role="slider"
      tabIndex={0}
      data-testid={testId}
      aria-label={ariaLabel}
      aria-valuemin={minValue}
      aria-valuemax={maxValue}
      aria-valuenow={value}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      style={{
        left: `${positionPercent}%`,
      }}
      className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 select-none touch-none z-10 transition-transform duration-100 ${
        isDragging
          ? "cursor-grabbing scale-135"
          : "cursor-grab hover:scale-130 active:cursor-grabbing"
      }`}
    >
      {/* Outer hit target for easy touch/mouse grab */}
      <div className="w-7 h-7 flex items-center justify-center">
        {/* Solid black circle handle */}
        <div
          className={`w-4 h-4 rounded-full bg-black border border-black transition-all ${
            isDragging ? "scale-110 ring-2 ring-neutral-400" : ""
          }`}
        />
      </div>
    </div>
  );
}
