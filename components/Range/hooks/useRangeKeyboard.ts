import React from "react";
import { clamp, snapToStep } from "@/lib/range-utils";
import { HANDLE } from "../constants";
import type { HandleIndex } from "../types";

interface UseRangeKeyboardOptions {
  isDiscrete: boolean;
  rangeValues: number[];
  step?: number;
  minLimit: number;
  maxLimit: number;
  minIndex: number;
  maxIndex: number;
  currentMin: number;
  currentMax: number;
  setHandleValue: (handle: HandleIndex, value: number) => void;
}

// Keyboard navigation for accessibility (WAI-ARIA slider pattern).
// Deltas are counted in steps (continuous mode) or options (fixed mode).
export function useRangeKeyboard({
  isDiscrete,
  rangeValues,
  step = 1,
  minLimit,
  maxLimit,
  minIndex,
  maxIndex,
  currentMin,
  currentMax,
  setHandleValue,
}: UseRangeKeyboardOptions) {
  const stepCount = isDiscrete
    ? rangeValues.length - 1
    : step > 0
      ? (maxLimit - minLimit) / step
      : 100;
  // Page keys jump about a tenth of the range, but always at least one step
  const pageDelta = Math.max(1, Math.round(stepCount / 10));
  // Arrow keys move a tenth of a page, so they never jump further than Page keys
  const arrowDelta = Math.max(1, Math.round(pageDelta / 10));

  const keyDeltas: Record<string, number> = {
    ArrowRight: arrowDelta,
    ArrowUp: arrowDelta,
    ArrowLeft: -arrowDelta,
    ArrowDown: -arrowDelta,
    PageUp: pageDelta,
    PageDown: -pageDelta,
  };

  const handleKeyDown = (handle: HandleIndex) => (e: React.KeyboardEvent) => {
    // Home/End go to the exact limit, even when it is not a multiple of step
    if (e.key === "Home" || e.key === "End") {
      e.preventDefault();
      const firstValue = isDiscrete ? rangeValues[0] : minLimit;
      const lastValue = isDiscrete
        ? rangeValues[rangeValues.length - 1]
        : maxLimit;
      setHandleValue(handle, e.key === "Home" ? firstValue : lastValue);
      return;
    }

    const delta = keyDeltas[e.key];
    if (delta === undefined) return;
    e.preventDefault();

    if (isDiscrete) {
      const index = handle === HANDLE.MIN ? minIndex : maxIndex;
      const nextIndex = clamp(index + delta, 0, rangeValues.length - 1);
      setHandleValue(handle, rangeValues[nextIndex]);
      return;
    }

    const value = handle === HANDLE.MIN ? currentMin : currentMax;
    const stepSize = step > 0 ? step : (maxLimit - minLimit) / 100;
    setHandleValue(
      handle,
      snapToStep(value + delta * stepSize, minLimit, maxLimit, step),
    );
  };

  return handleKeyDown;
}
