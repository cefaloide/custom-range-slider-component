import { describe, expect, it, vi } from "vitest";
import type React from "react";
import { renderHook } from "@testing-library/react";
import { useRangeKeyboard } from "../hooks/useRangeKeyboard";

const keyEvent = (key: string) =>
  ({ key, preventDefault: vi.fn() }) as unknown as React.KeyboardEvent & {
    preventDefault: ReturnType<typeof vi.fn>;
  };

const setup = (
  overrides: Partial<Parameters<typeof useRangeKeyboard>[0]> = {},
) => {
  const moveHandleToPercent = vi.fn();
  const { result } = renderHook(() =>
    useRangeKeyboard({
      isDiscrete: false,
      rangeValuesLength: 0,
      step: 1,
      minLimit: 0,
      maxLimit: 100,
      minPercent: 20,
      maxPercent: 60,
      moveHandleToPercent,
      ...overrides,
    }),
  );
  return { handleKeyDown: result.current, moveHandleToPercent };
};

describe("useRangeKeyboard", () => {
  it("moves the min handle forward with ArrowRight / ArrowUp", () => {
    const { handleKeyDown, moveHandleToPercent } = setup({ step: 5 });

    handleKeyDown(0)(keyEvent("ArrowRight"));
    expect(moveHandleToPercent).toHaveBeenLastCalledWith(0, 25);

    handleKeyDown(0)(keyEvent("ArrowUp"));
    expect(moveHandleToPercent).toHaveBeenLastCalledWith(0, 25);
  });

  it("moves the max handle backward with ArrowLeft / ArrowDown", () => {
    const { handleKeyDown, moveHandleToPercent } = setup({ step: 5 });

    handleKeyDown(1)(keyEvent("ArrowLeft"));
    expect(moveHandleToPercent).toHaveBeenLastCalledWith(1, 55);

    handleKeyDown(1)(keyEvent("ArrowDown"));
    expect(moveHandleToPercent).toHaveBeenLastCalledWith(1, 55);
  });

  it("never steps less than 2% in continuous mode", () => {
    const { handleKeyDown, moveHandleToPercent } = setup({
      step: 0.01,
      minLimit: 1,
      maxLimit: 10,
    });

    handleKeyDown(0)(keyEvent("ArrowRight"));
    expect(moveHandleToPercent).toHaveBeenLastCalledWith(0, 22);
  });

  it("defaults to a step of 1 when none is given", () => {
    const { handleKeyDown, moveHandleToPercent } = setup({
      step: undefined,
      minLimit: 0,
      maxLimit: 20,
    });

    handleKeyDown(0)(keyEvent("ArrowRight"));
    expect(moveHandleToPercent).toHaveBeenLastCalledWith(0, 25);
  });

  it("steps one option at a time in discrete mode", () => {
    const { handleKeyDown, moveHandleToPercent } = setup({
      isDiscrete: true,
      rangeValuesLength: 6,
    });

    handleKeyDown(1)(keyEvent("ArrowRight"));
    expect(moveHandleToPercent).toHaveBeenLastCalledWith(1, 80);
  });

  it("prevents default only for handled keys", () => {
    const { handleKeyDown, moveHandleToPercent } = setup();

    const arrow = keyEvent("ArrowRight");
    handleKeyDown(0)(arrow);
    expect(arrow.preventDefault).toHaveBeenCalled();

    const tab = keyEvent("Tab");
    handleKeyDown(0)(tab);
    expect(tab.preventDefault).not.toHaveBeenCalled();
    expect(moveHandleToPercent).toHaveBeenCalledTimes(1);
  });
});
