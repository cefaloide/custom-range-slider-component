"use client";

import { RangeTrack } from "./RangeTrack";
import { RangeHandle } from "./RangeHandle";
import { RangeLabel } from "./RangeLabel";
import { RangeBounds } from "./RangeBounds";
import { useRangeModel } from "./hooks/useRangeModel";
import { useRangeDrag } from "./hooks/useRangeDrag";
import { useRangeKeyboard } from "./hooks/useRangeKeyboard";
import { DEFAULT_CURRENCY, HANDLE } from "./constants";
import type { RangeProps } from "./types";

export function Range(props: RangeProps) {
  const {
    className = "",
    currency = DEFAULT_CURRENCY,
    showBounds = true,
    ariaLabelMin = "Minimum range value",
    ariaLabelMax = "Maximum range value",
  } = props;

  const {
    rangeValues,
    isDiscrete,
    minLimit,
    maxLimit,
    step,
    isLabelEditable,
    minIndex,
    maxIndex,
    currentMin,
    currentMax,
    minPercent,
    maxPercent,
    setHandleValue,
    moveHandleToPercent,
  } = useRangeModel(props);

  const {
    trackRef,
    draggingHandle,
    handlePointerDown,
    handleTrackPointerDown,
  } = useRangeDrag({ minPercent, maxPercent, moveHandleToPercent });

  const handleKeyDown = useRangeKeyboard({
    isDiscrete,
    rangeValues,
    step,
    minLimit,
    maxLimit,
    minIndex,
    maxIndex,
    currentMin,
    currentMax,
    setHandleValue,
  });

  return (
    <div
      className={`relative w-full max-w-xl mx-auto py-4 select-none ${className}`}
    >
      {showBounds && (
        <RangeBounds
          minLimit={minLimit}
          maxLimit={maxLimit}
          currency={currency}
        />
      )}

      {/* Main interactive row: Left Label, Track Line with Handles, Right Label */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Min Label (Clickable in normal mode, static in fixed mode) */}
        <div className="w-20 shrink-0">
          <RangeLabel
            value={currentMin}
            currency={currency}
            isEditable={isLabelEditable}
            isMinHandle={true}
            minLimit={minLimit}
            maxLimit={maxLimit}
            otherHandleValue={currentMax}
            onValueCommit={(value) => setHandleValue(HANDLE.MIN, value)}
            testId="min-label"
          />
        </div>

        {/* Custom Range Track & Two Handles */}
        <div className="relative flex-1 py-2">
          <RangeTrack
            leftPercent={minPercent}
            rightPercent={maxPercent}
            trackRef={trackRef}
            onTrackPointerDown={handleTrackPointerDown}
          >
            {/* Min Handle (Left) */}
            <RangeHandle
              positionPercent={minPercent}
              value={currentMin}
              minValue={minLimit}
              maxValue={currentMax}
              isDragging={draggingHandle === HANDLE.MIN}
              ariaLabel={ariaLabelMin}
              testId="handle-min"
              onPointerDown={handlePointerDown(HANDLE.MIN)}
              onKeyDown={handleKeyDown(HANDLE.MIN)}
            />

            {/* Max Handle (Right) */}
            <RangeHandle
              positionPercent={maxPercent}
              value={currentMax}
              minValue={currentMin}
              maxValue={maxLimit}
              isDragging={draggingHandle === HANDLE.MAX}
              ariaLabel={ariaLabelMax}
              testId="handle-max"
              onPointerDown={handlePointerDown(HANDLE.MAX)}
              onKeyDown={handleKeyDown(HANDLE.MAX)}
            />
          </RangeTrack>
        </div>

        {/* Max Label (Clickable in normal mode, static in fixed mode) */}
        <div className="w-20 text-right shrink-0">
          <RangeLabel
            value={currentMax}
            currency={currency}
            isEditable={isLabelEditable}
            isMinHandle={false}
            minLimit={minLimit}
            maxLimit={maxLimit}
            otherHandleValue={currentMin}
            onValueCommit={(value) => setHandleValue(HANDLE.MAX, value)}
            testId="max-label"
          />
        </div>
      </div>
    </div>
  );
}
