import { describe, expect, it } from "vitest";
import {
  clamp,
  valueToPercent,
  percentToValue,
  indexToPercent,
  percentToIndex,
  snapToStep,
  closestIndex,
  resolveNonCrossingRange,
  validateLabelInput,
  formatCurrency,
} from "../range-utils";

describe("clamp", () => {
  it("clamps to the bounds, swapping inverted ones", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(42, 0, 10)).toBe(10);
    expect(clamp(15, 10, 0)).toBe(10);
  });
});

describe("valueToPercent", () => {
  it("maps a value linearly onto 0-100, clamped", () => {
    expect(valueToPercent(5.5, 1, 10)).toBe(50);
    expect(valueToPercent(200, 0, 100)).toBe(100);
  });
});

describe("percentToValue", () => {
  it("maps a percentage back onto the scale, clamped", () => {
    expect(percentToValue(50, 1, 10, 0.01)).toBe(5.5);
    expect(percentToValue(150, 0, 100)).toBe(100);
  });

  it("rounds to the step without floating point noise", () => {
    expect(percentToValue(33, 0, 100, 5)).toBe(35);
    expect(percentToValue(30, 0, 1, 0.1)).toBe(0.3);
  });
});

describe("indexToPercent / percentToIndex", () => {
  it("converts between option indexes and track percentages", () => {
    expect(indexToPercent(2, 5)).toBe(50);
    expect(indexToPercent(10, 5)).toBe(100);
    expect(percentToIndex(30, 5)).toBe(1);
    expect(percentToIndex(-50, 5)).toBe(0);
  });
});

describe("snapToStep", () => {
  it("clamps and rounds to the closest step from min", () => {
    expect(snapToStep(5.994, 1, 100, 0.01)).toBe(5.99);
    expect(snapToStep(7, 1, 100, 5)).toBe(6);
    expect(snapToStep(Infinity, 0, 10, 3)).toBe(9);
    expect(snapToStep(-Infinity, 0, 10, 3)).toBe(0);
  });
});

describe("closestIndex", () => {
  it("finds the closest option, the first one on a tie", () => {
    expect(closestIndex([1.99, 5.99, 10.99], 6.5)).toBe(1);
    expect(closestIndex([1.99, 5.99, 10.99], 100)).toBe(2);
    expect(closestIndex([0, 10], 5)).toBe(0);
  });
});

describe("resolveNonCrossingRange", () => {
  it("clamps to the limits and collapses crossed values onto the max", () => {
    expect(resolveNonCrossingRange(20, 80, 0, 100)).toEqual([20, 80]);
    expect(resolveNonCrossingRange(-10, 150, 0, 100)).toEqual([0, 100]);
    expect(resolveNonCrossingRange(70, 30, 0, 100)).toEqual([30, 30]);
  });
});

describe("validateLabelInput", () => {
  const validateMin = (input: string) =>
    validateLabelInput(input, 0, 100, 60, true);
  const validateMax = (input: string) =>
    validateLabelInput(input, 0, 100, 20, false);

  it("accepts a sanitized value within range", () => {
    expect(validateMin(" 12,5 € ")).toEqual({ isValid: true, value: 12.5 });
    expect(validateMax("80")).toEqual({ isValid: true, value: 80 });
  });

  it("rejects empty or non numeric input, falling back to the bound", () => {
    expect(validateMin("  ")).toEqual({
      isValid: false,
      value: 0,
      error: "Value cannot be empty",
    });
    expect(validateMax("abc")).toEqual({
      isValid: false,
      value: 100,
      error: "Please enter a valid number",
    });
    expect(validateMin("abc")).toMatchObject({ isValid: false, value: 0 });
    expect(validateMax("")).toMatchObject({ isValid: false, value: 100 });
  });

  it("rejects values outside the bounds or crossing the other handle", () => {
    expect(validateMin("-5")).toMatchObject({ isValid: false, value: 0 });
    expect(validateMin("75")).toMatchObject({ isValid: false, value: 60 });
    expect(validateMax("120")).toMatchObject({ isValid: false, value: 100 });
    expect(validateMax("10")).toMatchObject({ isValid: false, value: 20 });
  });
});

describe("formatCurrency", () => {
  it("shows decimals only for fractional numbers unless forced", () => {
    expect(formatCurrency(10000)).toBe("10000€");
    expect(formatCurrency(5.5)).toBe("5.50€");
    expect(formatCurrency(1, "$", { showDecimalsIfZero: true })).toBe("1.00$");
  });
});
