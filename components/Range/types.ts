import { RANGE_MODE } from "./constants";

export interface BaseRangeProps {
  ariaLabelMax?: string;
  ariaLabelMin?: string;
  className?: string;
  currency?: string;
  onChange: (value: [number, number]) => void;
  showBounds?: boolean;
  value: [number, number];
}

export interface NormalRangeProps extends BaseRangeProps {
  allowLabelEdit?: boolean;
  max: number;
  min: number;
  mode?: typeof RANGE_MODE.NORMAL;
  rangeValues?: never;
  step?: number;
}

export interface FixedRangeProps extends BaseRangeProps {
  allowLabelEdit?: false;
  max?: never;
  min?: never;
  mode: typeof RANGE_MODE.FIXED;
  rangeValues: number[];
  step?: never;
}

export type RangeProps = NormalRangeProps | FixedRangeProps;

export type HandleIndex = 0 | 1;

export interface RangeConfig {
  isFixedMode: boolean;
  rangeValues: number[];
  isDiscrete: boolean;
  minLimit: number;
  maxLimit: number;
  step?: number;
  isLabelEditable: boolean;
}
