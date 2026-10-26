import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useRangeModel } from "../hooks/useRangeModel";

// Rendering, clamping and snapping are covered through <Range> in Range.test.tsx

describe("useRangeModel", () => {
  it("setHandleValue never lets the handles cross", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useRangeModel({
        mode: "normal",
        min: 0,
        max: 100,
        value: [20, 60],
        onChange,
      }),
    );

    act(() => result.current.setHandleValue(0, 75));
    expect(onChange).toHaveBeenLastCalledWith([60, 60]);

    act(() => result.current.setHandleValue(1, 5));
    expect(onChange).toHaveBeenLastCalledWith([20, 20]);
  });
});
