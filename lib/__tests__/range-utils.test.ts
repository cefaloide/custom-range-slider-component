import { describe, expect, it } from "vitest";
import {
  clamp,
  valueToPercent,
  percentToValue,
  indexToPercent,
  percentToIndex,
  resolveNonCrossingRange,
  validateLabelInput,
  formatCurrency,
} from "../range-utils";

describe("clamp", () => {
  it("returns the value when it is within bounds", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("clamps to the lower and upper bounds", () => {
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(42, 0, 10)).toBe(10);
  });

  it("swaps inverted bounds", () => {
    expect(clamp(15, 10, 0)).toBe(10);
    expect(clamp(-1, 10, 0)).toBe(0);
  });
});

describe("valueToPercent", () => {
  it("maps a value linearly onto 0-100", () => {
    expect(valueToPercent(0, 0, 100)).toBe(0);
    expect(valueToPercent(25, 0, 100)).toBe(25);
    expect(valueToPercent(5.5, 1, 10)).toBe(50);
  });

  it("clamps values outside the scale", () => {
    expect(valueToPercent(-10, 0, 100)).toBe(0);
    expect(valueToPercent(200, 0, 100)).toBe(100);
  });

  it("returns 0 for an empty or inverted scale", () => {
    expect(valueToPercent(5, 10, 10)).toBe(0);
    expect(valueToPercent(5, 10, 0)).toBe(0);
  });
});

describe("percentToValue", () => {
  it("maps a percentage back onto the scale", () => {
    expect(percentToValue(50, 0, 100)).toBe(50);
    expect(percentToValue(50, 1, 10, 0.01)).toBe(5.5);
  });

  it("rounds to the nearest step", () => {
    expect(percentToValue(33, 0, 100, 5)).toBe(35);
    expect(percentToValue(12, 0, 100, 10)).toBe(10);
  });

  it("avoids floating point noise with decimal steps", () => {
    expect(percentToValue(30, 0, 1, 0.1)).toBe(0.3);
    expect(percentToValue(33.333, 0, 1, 0.01)).toBe(0.33);
  });

  it("clamps out-of-range percentages", () => {
    expect(percentToValue(-20, 0, 100)).toBe(0);
    expect(percentToValue(150, 0, 100)).toBe(100);
  });

  it("does not round when step is not positive", () => {
    expect(percentToValue(33.3, 0, 100, 0)).toBeCloseTo(33.3);
  });

  it("returns min for an empty or inverted scale", () => {
    expect(percentToValue(50, 10, 10)).toBe(10);
    expect(percentToValue(50, 10, 0)).toBe(10);
  });
});

describe("indexToPercent", () => {
  it("spreads indexes evenly along the track", () => {
    expect(indexToPercent(0, 5)).toBe(0);
    expect(indexToPercent(2, 5)).toBe(50);
    expect(indexToPercent(4, 5)).toBe(100);
  });

  it("clamps out-of-range indexes", () => {
    expect(indexToPercent(-1, 5)).toBe(0);
    expect(indexToPercent(10, 5)).toBe(100);
  });

  it("returns 0 when there is at most one option", () => {
    expect(indexToPercent(0, 1)).toBe(0);
    expect(indexToPercent(0, 0)).toBe(0);
  });
});

describe("percentToIndex", () => {
  it("snaps a percentage to the closest index", () => {
    expect(percentToIndex(0, 5)).toBe(0);
    expect(percentToIndex(30, 5)).toBe(1);
    expect(percentToIndex(40, 5)).toBe(2);
    expect(percentToIndex(100, 5)).toBe(4);
  });

  it("clamps out-of-range percentages", () => {
    expect(percentToIndex(-50, 5)).toBe(0);
    expect(percentToIndex(150, 5)).toBe(4);
  });

  it("returns 0 when there is at most one option", () => {
    expect(percentToIndex(80, 1)).toBe(0);
  });
});

describe("resolveNonCrossingRange", () => {
  it("keeps a valid range untouched", () => {
    expect(resolveNonCrossingRange(20, 80, 0, 100)).toEqual([20, 80]);
  });

  it("clamps both values to the limits", () => {
    expect(resolveNonCrossingRange(-10, 150, 0, 100)).toEqual([0, 100]);
  });

  it("collapses crossed values onto the max", () => {
    expect(resolveNonCrossingRange(70, 30, 0, 100)).toEqual([30, 30]);
  });
});

describe("validateLabelInput", () => {
  describe("min handle", () => {
    const validate = (input: string) =>
      validateLabelInput(input, 0, 100, 60, true);

    it("accepts a value between the lower bound and the max handle", () => {
      expect(validate("25")).toEqual({ isValid: true, value: 25 });
    });

    it("strips the currency symbol and whitespace", () => {
      expect(validate(" 25 € ")).toEqual({ isValid: true, value: 25 });
    });

    it("accepts a comma as decimal separator", () => {
      expect(validate("12,5")).toEqual({ isValid: true, value: 12.5 });
    });

    it("rejects an empty input, falling back to the lower bound", () => {
      expect(validate("  ")).toEqual({
        isValid: false,
        value: 0,
        error: "Value cannot be empty",
      });
    });

    it("rejects a non numeric input", () => {
      expect(validate("abc")).toMatchObject({
        isValid: false,
        value: 0,
        error: "Please enter a valid number",
      });
    });

    it("rejects values below the lower bound", () => {
      expect(validate("-5")).toMatchObject({ isValid: false, value: 0 });
    });

    it("rejects values above the max handle", () => {
      expect(validate("75")).toMatchObject({ isValid: false, value: 60 });
    });
  });

  describe("max handle", () => {
    const validate = (input: string) =>
      validateLabelInput(input, 0, 100, 20, false);

    it("accepts a value between the min handle and the upper bound", () => {
      expect(validate("80")).toEqual({ isValid: true, value: 80 });
    });

    it("falls back to the upper bound on empty input", () => {
      expect(validate("")).toMatchObject({ isValid: false, value: 100 });
    });

    it("falls back to the upper bound on non numeric input", () => {
      expect(validate("abc")).toMatchObject({ isValid: false, value: 100 });
    });

    it("rejects values above the upper bound", () => {
      expect(validate("120")).toMatchObject({ isValid: false, value: 100 });
    });

    it("rejects values below the min handle", () => {
      expect(validate("10")).toMatchObject({ isValid: false, value: 20 });
    });
  });
});

describe("formatCurrency", () => {
  it("omits decimals for whole numbers", () => {
    expect(formatCurrency(1)).toBe("1€");
    expect(formatCurrency(10000)).toBe("10000€");
  });

  it("shows two decimals for fractional numbers", () => {
    expect(formatCurrency(5.99)).toBe("5.99€");
    expect(formatCurrency(5.5)).toBe("5.50€");
  });

  it("can force decimals on whole numbers", () => {
    expect(formatCurrency(1, "€", { showDecimalsIfZero: true })).toBe("1.00€");
  });

  it("uses a custom currency symbol", () => {
    expect(formatCurrency(3, "$")).toBe("3$");
  });

  it("formats NaN as zero", () => {
    expect(formatCurrency(NaN)).toBe("0€");
  });
});
