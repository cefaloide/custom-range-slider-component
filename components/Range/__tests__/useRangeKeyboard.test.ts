import { describe, expect, it, vi } from "vitest";
import type React from "react";
import { renderHook } from "@testing-library/react";
import { useRangeKeyboard } from "../hooks/useRangeKeyboard";

// Arrow keys and discrete stepping are covered through <Range> in Range.test.tsx

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
  it("never steps less than 2% in continuous mode", () => {
    const { handleKeyDown, moveHandleToPercent } = setup({
      step: 0.01,
      minLimit: 1,
      maxLimit: 10,
    });

    handleKeyDown(0)(keyEvent("ArrowRight"));
    expect(moveHandleToPercent).toHaveBeenLastCalledWith(0, 22);
  });
});
