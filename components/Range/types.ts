import {RANGE_MODE} from "./constants";

export interface BaseRangeProps {
  ariaLabelMax?: string;
  ariaLabelMin?: string;
  className?: string;
  currency?: string;
  showBounds?: boolean;
}

export interface NormalRangeProps extends BaseRangeProps {
  allowLabelEdit?: boolean;
  max: number;
  min: number;
  mode?: typeof RANGE_MODE.NORMAL;
  onChange: (value: [number, number]) => void;
  rangeValues?: never;
  step?: number;
  value: [number, number];
}

export interface FixedRangeProps extends BaseRangeProps {
  allowLabelEdit?: false;
  max?: never;
  min?: never;
  mode: typeof RANGE_MODE.FIXED;
  onChange: (value: [number, number]) => void;
  rangeValues: number[];
  step?: never;
  value: [number, number];
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
