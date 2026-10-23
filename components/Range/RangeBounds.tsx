"use client";

interface RangeBoundsProps {
  minLimit: number;
  maxLimit: number;
  currency: string;
}

// Absolute Bounds Display (e.g. "Min 1€" and "Max 100€")
export function RangeBounds({
  minLimit,
  maxLimit,
  currency,
}: RangeBoundsProps) {
  return (
    <div
      data-testid="range-bounds-header"
      className="flex justify-between items-center mb-1 text-[13px] font-mono font-medium text-neutral-500 tracking-tight"
    >
      <span>Min {`${minLimit}${currency}`}</span>
      <span>Max {`${maxLimit}${currency}`}</span>
    </div>
  );
}
