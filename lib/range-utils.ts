/**
 * Clamps a number between min and max bounds.
 */
export function clamp(value: number, min: number, max: number): number {
  if (min > max) [min, max] = [max, min];

  return Math.min(Math.max(value, min), max);
}

/**
 * Converts a numeric value to a percentage (0 - 100) along a [min, max] scale.
 */
export function valueToPercent(
  value: number,
  min: number,
  max: number,
): number {
  if (max <= min) return 0;

  const rawPercent = ((value - min) / (max - min)) * 100;
  return clamp(rawPercent, 0, 100);
}

/**
 * Converts a percentage (0 - 100) to a numeric value between [min, max] with optional step rounding.
 */
export function percentToValue(
  percent: number,
  min: number,
  max: number,
  step = 1,
): number {
  if (max <= min) return min;
  const clampedPercent = clamp(percent, 0, 100);
  const rawValue = min + (clampedPercent / 100) * (max - min);

  if (step <= 0) return rawValue;

  // Determine decimal precision of step to avoid IEEE 754 float precision errors
  const stepDecimals = (step.toString().split(".")[1] || "").length;
  const steppedValue = Math.round((rawValue - min) / step) * step + min;
  const finalValue = Number(steppedValue.toFixed(stepDecimals));

  return clamp(finalValue, min, max);
}

/**
 * Converts an index (0 to length - 1) of fixed options to a percentage on the track.
 */
export function indexToPercent(index: number, totalOptions: number): number {
  if (totalOptions <= 1) return 0;
  const clampedIndex = clamp(index, 0, totalOptions - 1);
  return (clampedIndex / (totalOptions - 1)) * 100;
}

/**
 * Maps a percentage (0 - 100) on the track to the closest index in a fixed options array.
 */
export function percentToIndex(percent: number, totalOptions: number): number {
  if (totalOptions <= 1) return 0;
  const clampedPercent = clamp(percent, 0, 100);
  const rawIndex = (clampedPercent / 100) * (totalOptions - 1);
  const roundedIndex = Math.round(rawIndex);
  return clamp(roundedIndex, 0, totalOptions - 1);
}

/**
 * Validates and adjusts range handle positions so handles never cross.
 * Ensures: minLimit <= minVal <= maxVal <= maxLimit
 */
export function resolveNonCrossingRange(
  newMin: number,
  newMax: number,
  minLimit: number,
  maxLimit: number,
): [number, number] {
  const min = clamp(newMin, minLimit, maxLimit);
  const max = clamp(newMax, minLimit, maxLimit);

  if (min > max) return [max, max];

  return [min, max];
}

/**
 * Validates inline label text input for Exercise 1.
 * Ensures entered number respects bounds and does not cross other handle.
 */
export interface LabelValidationResult {
  isValid: boolean;
  value: number;
  error?: string;
}

export function validateLabelInput(
  rawInput: string,
  minBound: number,
  maxBound: number,
  otherHandleValue: number,
  isMinHandle: boolean,
): LabelValidationResult {
  // Strip currency symbol and whitespace
  const sanitized = rawInput
    .replace(/[€,\s]/g, (match) => (match === "," ? "." : ""))
    .trim();

  if (sanitized === "") {
    return {
      isValid: false,
      value: isMinHandle ? minBound : maxBound,
      error: "Value cannot be empty",
    };
  }

  const parsed = Number(sanitized);

  if (isNaN(parsed)) {
    return {
      isValid: false,
      value: isMinHandle ? minBound : maxBound,
      error: "Please enter a valid number",
    };
  }

  if (isMinHandle) {
    if (parsed < minBound) {
      return {
        isValid: false,
        value: minBound,
        error: `Minimum cannot be less than ${minBound}`,
      };
    }
    if (parsed > otherHandleValue) {
      return {
        isValid: false,
        value: otherHandleValue,
        error: `Minimum cannot exceed current maximum (${otherHandleValue})`,
      };
    }
    return {
      isValid: true,
      value: parsed,
    };
  } else {
    // Max handle
    if (parsed > maxBound) {
      return {
        isValid: false,
        value: maxBound,
        error: `Maximum cannot exceed ${maxBound}`,
      };
    }
    if (parsed < otherHandleValue) {
      return {
        isValid: false,
        value: otherHandleValue,
        error: `Maximum cannot be less than current minimum (${otherHandleValue})`,
      };
    }
    return {
      isValid: true,
      value: parsed,
    };
  }
}

/**
 * Formats a value as currency, matching specification (e.g. 5.99€, 1€, 10000€).
 */
export function formatCurrency(
  value: number,
  currency = "€",
  options?: { showDecimalsIfZero?: boolean },
): string {
  if (isNaN(value)) return `0${currency}`;

  // Check if it has non-zero decimals
  const hasDecimals = value % 1 !== 0;
  const formattedNumber =
    hasDecimals || options?.showDecimalsIfZero
      ? value.toFixed(2)
      : value.toString();

  return `${formattedNumber}${currency}`;
}
