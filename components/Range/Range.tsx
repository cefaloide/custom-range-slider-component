"use client";

import { RangeTrack } from "./RangeTrack";
import { RangeHandle } from "./RangeHandle";
import { RangeLabel } from "./RangeLabel";
import { RangeBounds } from "./RangeBounds";
import { useRangeModel } from "./hooks/useRangeModel";
import { useRangeDrag } from "./hooks/useRangeDrag";
import { useRangeKeyboard } from "./hooks/useRangeKeyboard";
import { DEFAULT_CURRENCY } from "./constants";
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
    rangeValuesLength: rangeValues.length,
    step,
    minLimit,
    maxLimit,
    minPercent,
    maxPercent,
    moveHandleToPercent,
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
            onValueCommit={(value) => setHandleValue(0, value)}
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
              isDragging={draggingHandle === 0}
              ariaLabel={ariaLabelMin}
              testId="handle-min"
              onPointerDown={handlePointerDown(0)}
              onKeyDown={handleKeyDown(0)}
            />

            {/* Max Handle (Right) */}
            <RangeHandle
              positionPercent={maxPercent}
              value={currentMax}
              minValue={currentMin}
              maxValue={maxLimit}
              isDragging={draggingHandle === 1}
              ariaLabel={ariaLabelMax}
              testId="handle-max"
              onPointerDown={handlePointerDown(1)}
              onKeyDown={handleKeyDown(1)}
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
            onValueCommit={(value) => setHandleValue(1, value)}
            testId="max-label"
          />
        </div>
      </div>
    </div>
  );
}
