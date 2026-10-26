import type { FixedApiResponse, NormalApiResponse } from "@/types/api";

export const NORMAL_RANGE_DATA: NormalApiResponse = {
  min: 1,
  max: 100,
};

export const FIXED_RANGE_DATA: FixedApiResponse = {
  rangeValues: [1.99, 5.99, 10.99, 30.99, 50.99, 70.99],
};
