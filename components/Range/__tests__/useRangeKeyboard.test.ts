import { describe, expect, it, vi } from "vitest";
import type React from "react";
import { renderHook } from "@testing-library/react";
import { useRangeKeyboard } from "../hooks/useRangeKeyboard";

// Arrow keys and discrete stepping are also covered through <Range> in Range.test.tsx

const FIXED_VALUES = [1.99, 5.99, 10.99, 30.99, 50.99, 70.99];

const keyEvent = (key: string) =>
  ({ key, preventDefault: vi.fn() }) as unknown as React.KeyboardEvent & {
    preventDefault: ReturnType<typeof vi.fn>;
  };

const setup = (
  overrides: Partial<Parameters<typeof useRangeKeyboard>[0]> = {},
) => {
  const setHandleValue = vi.fn();
  const { result } = renderHook(() =>
    useRangeKeyboard({
      isDiscrete: false,
      rangeValues: [],
      step: 1,
      minLimit: 0,
      maxLimit: 100,
      minIndex: -1,
      maxIndex: -1,
      currentMin: 20,
      currentMax: 60,
      setHandleValue,
      ...overrides,
    }),
  );
  return { handleKeyDown: result.current, setHandleValue };
};

describe("useRangeKeyboard", () => {
  it("moves a tenth of a page per arrow key, even for small steps", () => {
    const { handleKeyDown, setHandleValue } = setup({
      step: 0.01,
      minLimit: 1,
      maxLimit: 100,
      currentMin: 5.99,
    });

    // 9900 steps -> page = 990 steps, arrow = 99 steps
    handleKeyDown(0)(keyEvent("ArrowRight"));
    expect(setHandleValue).toHaveBeenLastCalledWith(0, 6.98);

    handleKeyDown(0)(keyEvent("ArrowLeft"));
    expect(setHandleValue).toHaveBeenLastCalledWith(0, 5);
  });

  it("moves one step per arrow key when the range is small", () => {
    const { handleKeyDown, setHandleValue } = setup();

    handleKeyDown(1)(keyEvent("ArrowRight"));
    expect(setHandleValue).toHaveBeenLastCalledWith(1, 61);
  });

  it("jumps a tenth of the range with Page keys and to the limits with Home/End", () => {
    const { handleKeyDown, setHandleValue } = setup();

    handleKeyDown(1)(keyEvent("PageUp"));
    expect(setHandleValue).toHaveBeenLastCalledWith(1, 70);

    handleKeyDown(0)(keyEvent("PageDown"));
    expect(setHandleValue).toHaveBeenLastCalledWith(0, 10);

    handleKeyDown(0)(keyEvent("Home"));
    expect(setHandleValue).toHaveBeenLastCalledWith(0, 0);

    handleKeyDown(1)(keyEvent("End"));
    expect(setHandleValue).toHaveBeenLastCalledWith(1, 100);
  });

  it("reaches the exact limit with End when it is not a multiple of step", () => {
    const { handleKeyDown, setHandleValue } = setup({ step: 3, maxLimit: 10 });

    handleKeyDown(1)(keyEvent("End"));
    expect(setHandleValue).toHaveBeenLastCalledWith(1, 10);
  });

  it("moves by option index in fixed mode", () => {
    const { handleKeyDown, setHandleValue } = setup({
      isDiscrete: true,
      rangeValues: FIXED_VALUES,
      minLimit: 1.99,
      maxLimit: 70.99,
      minIndex: 1,
      maxIndex: 3,
      currentMin: 5.99,
      currentMax: 30.99,
    });

    handleKeyDown(1)(keyEvent("PageUp"));
    expect(setHandleValue).toHaveBeenLastCalledWith(1, 50.99);

    handleKeyDown(0)(keyEvent("Home"));
    expect(setHandleValue).toHaveBeenLastCalledWith(0, 1.99);

    handleKeyDown(1)(keyEvent("End"));
    expect(setHandleValue).toHaveBeenLastCalledWith(1, 70.99);
  });

  it("ignores other keys", () => {
    const { handleKeyDown, setHandleValue } = setup();
    const event = keyEvent("a");

    handleKeyDown(0)(event);
    expect(setHandleValue).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
