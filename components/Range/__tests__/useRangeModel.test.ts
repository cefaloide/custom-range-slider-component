import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { resolveRangeConfig, useRangeModel } from "../hooks/useRangeModel";
import type { RangeProps } from "../types";

const FIXED_VALUES = [1.99, 5.99, 10.99, 30.99, 50.99, 70.99];

const normalProps = (overrides: Partial<RangeProps> = {}): RangeProps =>
  ({
    mode: "normal",
    min: 0,
    max: 100,
    step: 1,
    value: [20, 60],
    onChange: vi.fn(),
    ...overrides,
  }) as RangeProps;

const fixedProps = (overrides: Partial<RangeProps> = {}): RangeProps =>
  ({
    mode: "fixed",
    rangeValues: FIXED_VALUES,
    value: [5.99, 30.99],
    onChange: vi.fn(),
    ...overrides,
  }) as RangeProps;

describe("resolveRangeConfig", () => {
  it("uses min, max and step in normal mode", () => {
    expect(resolveRangeConfig(normalProps({ step: 0.5 }))).toEqual({
      isFixedMode: false,
      rangeValues: [],
      isDiscrete: false,
      minLimit: 0,
      maxLimit: 100,
      step: 0.5,
      isLabelEditable: true,
    });
  });

  it("treats a missing mode as normal", () => {
    const props = normalProps();
    delete (props as { mode?: string }).mode;
    expect(resolveRangeConfig(props).isFixedMode).toBe(false);
  });

  it("respects allowLabelEdit in normal mode", () => {
    expect(
      resolveRangeConfig(normalProps({ allowLabelEdit: false }))
        .isLabelEditable,
    ).toBe(false);
  });

  it("derives limits from rangeValues in fixed mode", () => {
    expect(resolveRangeConfig(fixedProps())).toEqual({
      isFixedMode: true,
      rangeValues: FIXED_VALUES,
      isDiscrete: true,
      minLimit: 1.99,
      maxLimit: 70.99,
      step: undefined,
      isLabelEditable: false,
    });
  });

  it("falls back to default limits with empty rangeValues", () => {
    const config = resolveRangeConfig(fixedProps({ rangeValues: [] }));
    expect(config.minLimit).toBe(0);
    expect(config.maxLimit).toBe(100);
    expect(config.isDiscrete).toBe(false);
  });
});

describe("useRangeModel", () => {
  describe("normal mode", () => {
    it("exposes current values and their linear percentages", () => {
      const { result } = renderHook(() =>
        useRangeModel(normalProps({ min: 0, max: 200, value: [50, 150] })),
      );
      expect(result.current.currentMin).toBe(50);
      expect(result.current.currentMax).toBe(150);
      expect(result.current.minPercent).toBe(25);
      expect(result.current.maxPercent).toBe(75);
    });

    it("clamps and un-crosses values coming from props", () => {
      const { result } = renderHook(() =>
        useRangeModel(normalProps({ value: [-20, 150] })),
      );
      expect(result.current.currentMin).toBe(0);
      expect(result.current.currentMax).toBe(100);

      const crossed = renderHook(() =>
        useRangeModel(normalProps({ value: [80, 30] })),
      );
      expect(crossed.result.current.currentMin).toBe(30);
      expect(crossed.result.current.currentMax).toBe(30);
    });

    it("setHandleValue updates one handle and keeps the other", () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useRangeModel(normalProps({ onChange })),
      );

      act(() => result.current.setHandleValue(0, 40));
      expect(onChange).toHaveBeenLastCalledWith([40, 60]);

      act(() => result.current.setHandleValue(1, 90));
      expect(onChange).toHaveBeenLastCalledWith([20, 90]);
    });

    it("setHandleValue never lets the handles cross", () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useRangeModel(normalProps({ onChange })),
      );

      act(() => result.current.setHandleValue(0, 75));
      expect(onChange).toHaveBeenLastCalledWith([60, 60]);

      act(() => result.current.setHandleValue(1, 5));
      expect(onChange).toHaveBeenLastCalledWith([20, 20]);
    });

    it("moveHandleToPercent converts the percentage using the step", () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useRangeModel(normalProps({ step: 10, onChange })),
      );

      act(() => result.current.moveHandleToPercent(1, 84));
      expect(onChange).toHaveBeenLastCalledWith([20, 80]);
    });
  });

  describe("fixed mode", () => {
    it("positions handles by index of the value", () => {
      const { result } = renderHook(() => useRangeModel(fixedProps()));
      expect(result.current.minPercent).toBe(20);
      expect(result.current.maxPercent).toBe(60);
    });

    it("falls back to the ends for values not in rangeValues", () => {
      const { result } = renderHook(() =>
        useRangeModel(fixedProps({ value: [3, 40] })),
      );
      expect(result.current.minPercent).toBe(0);
      expect(result.current.maxPercent).toBe(100);
    });

    it("moveHandleToPercent snaps to the closest option", () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useRangeModel(fixedProps({ onChange })),
      );

      act(() => result.current.moveHandleToPercent(1, 78));
      expect(onChange).toHaveBeenLastCalledWith([5.99, 50.99]);

      act(() => result.current.moveHandleToPercent(0, 3));
      expect(onChange).toHaveBeenLastCalledWith([1.99, 30.99]);
    });
  });
});
