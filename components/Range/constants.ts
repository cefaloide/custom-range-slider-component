export const RANGE_MODE = {
  NORMAL: "normal",
  FIXED: "fixed",
} as const;

// Stable reference so memoized callbacks don't change on every render
export const NO_RANGE_VALUES: number[] = [];

export const DEFAULT_MIN_LIMIT = 0;
export const DEFAULT_MAX_LIMIT = 100;