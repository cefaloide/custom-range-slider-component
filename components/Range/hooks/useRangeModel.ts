import { useCallback } from "react";
import {
  valueToPercent,
  percentToValue,
  indexToPercent,
  percentToIndex,
  closestIndex,
  resolveNonCrossingRange,
} from "@/lib/range-utils";
import {
  DEFAULT_MAX_LIMIT,
  DEFAULT_MIN_LIMIT,
  HANDLE,
  NO_RANGE_VALUES,
  RANGE_MODE,
} from "../constants";
import type { HandleIndex, RangeConfig, RangeProps } from "../types";

// Normalize modes and boundary limits
export function resolveRangeConfig(props: RangeProps): RangeConfig {
  const isFixedMode = props.mode === RANGE_MODE.FIXED;
  const rangeValues = isFixedMode ? props.rangeValues : NO_RANGE_VALUES;

  return {
    isFixedMode,
    rangeValues,
    isDiscrete: rangeValues.length > 1,
    minLimit: isFixedMode ? (rangeValues[0] ?? DEFAULT_MIN_LIMIT) : props.min,
    maxLimit: isFixedMode
      ? (rangeValues.at(-1) ?? DEFAULT_MAX_LIMIT)
      : props.max,
    step: isFixedMode ? undefined : props.step,
    isLabelEditable: !isFixedMode && (props.allowLabelEdit ?? true),
  };
}

export function useRangeModel(props: RangeProps) {
  const config = resolveRangeConfig(props);
  const { rangeValues, isDiscrete, minLimit, maxLimit, step } = config;
  const { onChange } = props;

  const [clampedMin, clampedMax] = resolveNonCrossingRange(
    props.value[0],
    props.value[1],
    minLimit,
    maxLimit,
  );

  // In fixed mode, values that are not options snap to the closest one
  const minIndex = isDiscrete ? closestIndex(rangeValues, clampedMin) : -1;
  const maxIndex = isDiscrete ? closestIndex(rangeValues, clampedMax) : -1;
  const currentMin = isDiscrete ? rangeValues[minIndex] : clampedMin;
  const currentMax = isDiscrete ? rangeValues[maxIndex] : clampedMax;

  // Value -> track percentage: by index in fixed mode, linear otherwise
  const minPercent = isDiscrete
    ? indexToPercent(minIndex, rangeValues.length)
    : valueToPercent(currentMin, minLimit, maxLimit);
  const maxPercent = isDiscrete
    ? indexToPercent(maxIndex, rangeValues.length)
    : valueToPercent(currentMax, minLimit, maxLimit);

  // Handles never cross: min is capped at currentMax, max floored at currentMin
  const setHandleValue = useCallback(
    (handle: HandleIndex, value: number) => {
      onChange(
        handle === HANDLE.MIN
          ? [Math.min(value, currentMax), currentMax]
          : [currentMin, Math.max(value, currentMin)],
      );
    },
    [currentMin, currentMax, onChange],
  );

  // Track percentage -> value: by index in fixed mode, linear otherwise
  const moveHandleToPercent = useCallback(
    (handle: HandleIndex, percent: number) => {
      const value = isDiscrete
        ? rangeValues[percentToIndex(percent, rangeValues.length)]
        : percentToValue(percent, minLimit, maxLimit, step);
      setHandleValue(handle, value);
    },
    [isDiscrete, rangeValues, minLimit, maxLimit, step, setHandleValue],
  );

  return {
    ...config,
    minIndex,
    maxIndex,
    currentMin,
    currentMax,
    minPercent,
    maxPercent,
    setHandleValue,
    moveHandleToPercent,
  };
}
