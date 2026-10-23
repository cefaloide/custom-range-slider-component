import React from "react";
import type { HandleIndex } from "../types";

interface UseRangeKeyboardOptions {
  isDiscrete: boolean;
  rangeValuesLength: number;
  step?: number;
  minLimit: number;
  maxLimit: number;
  minPercent: number;
  maxPercent: number;
  moveHandleToPercent: (handle: HandleIndex, percent: number) => void;
}

// Keyboard navigation for accessibility (deltas in track percent, clamped downstream)
export function useRangeKeyboard({
  isDiscrete,
  rangeValuesLength,
  step,
  minLimit,
  maxLimit,
  minPercent,
  maxPercent,
  moveHandleToPercent,
}: UseRangeKeyboardOptions) {
  // In continuous mode, never step less than one `step` so rounding can't stall the handle
  const smallStep = isDiscrete
    ? 100 / (rangeValuesLength - 1)
    : Math.max(2, ((step ?? 1) / (maxLimit - minLimit)) * 100);
  const keyDeltas: Record<string, number> = {
    ArrowRight: smallStep,
    ArrowUp: smallStep,
    ArrowLeft: -smallStep,
    ArrowDown: -smallStep,
  };

  const handleKeyDown = (handle: HandleIndex) => (e: React.KeyboardEvent) => {
    const delta = keyDeltas[e.key];
    if (delta === undefined) return;
    e.preventDefault();
    const currentPercent = handle === 0 ? minPercent : maxPercent;
    moveHandleToPercent(handle, currentPercent + delta);
  };

  return handleKeyDown;
}
