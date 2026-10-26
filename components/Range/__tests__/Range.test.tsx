import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Range } from "..";
import type { NormalRangeProps } from "../types";

const FIXED_VALUES = [1.99, 5.99, 10.99, 30.99, 50.99, 70.99];

// jsdom has no layout: make the track span clientX 0..100 so 1px === 1%
const mockTrackRect = (width = 100) =>
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    left: 0,
    width,
    top: 0,
    height: 10,
    right: width,
    bottom: 10,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });

const renderNormal = (overrides: Partial<NormalRangeProps> = {}) => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(
    <Range
      mode="normal"
      min={0}
      max={100}
      step={1}
      value={[20, 60]}
      onChange={onChange}
      {...overrides}
    />,
  );
  return { user, onChange };
};

const renderFixed = (value: [number, number] = [5.99, 30.99]) => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(
    <Range
      mode="fixed"
      rangeValues={FIXED_VALUES}
      value={value}
      onChange={onChange}
    />,
  );
  return { user, onChange };
};

const handleMin = () => screen.getByTestId("handle-min");
const handleMax = () => screen.getByTestId("handle-max");
const track = () => handleMin().parentElement as HTMLElement;

describe("Range", () => {
  describe("rendering", () => {
    it("shows the bounds header with the currency", () => {
      renderNormal({ min: 1, max: 10, currency: "€" });
      const header = screen.getByTestId("range-bounds-header");
      expect(header.textContent).toContain("Min 1€");
      expect(header.textContent).toContain("Max 10€");
    });

    it("clamps values outside the limits", () => {
      renderNormal({ value: [-5, 500] });
      expect(screen.getByTestId("min-label").textContent).toBe("0.00€");
      expect(screen.getByTestId("max-label").textContent).toBe("100.00€");
    });

    it("positions the handles and exposes slider semantics", () => {
      renderNormal({ ariaLabelMin: "From", ariaLabelMax: "To" });
      expect(handleMin().style.left).toBe("20%");
      expect(handleMax().style.left).toBe("60%");

      const highlight = screen.getByTestId("range-highlight");
      expect(highlight.style.left).toBe("20%");
      expect(highlight.style.width).toBe("40%");

      const [min, max] = screen.getAllByRole("slider");
      expect(min.getAttribute("aria-label")).toBe("From");
      expect(min.getAttribute("aria-valuemax")).toBe("60");
      expect(min.getAttribute("aria-valuenow")).toBe("20");
      expect(max.getAttribute("aria-label")).toBe("To");
      expect(max.getAttribute("aria-valuemin")).toBe("20");
      expect(max.getAttribute("aria-valuenow")).toBe("60");
    });

    it("positions handles by option index and disables editing in fixed mode", () => {
      renderFixed();
      expect(handleMin().style.left).toBe("20%");
      expect(handleMax().style.left).toBe("60%");
      expect(
        (screen.getByTestId("min-label") as HTMLButtonElement).disabled,
      ).toBe(true);
    });
  });

  describe("label editing", () => {
    it("commits edited values through onChange", async () => {
      const { user, onChange } = renderNormal();
      await user.click(screen.getByTestId("min-label"));
      const minInput = screen.getByTestId("min-label-input");
      await user.clear(minInput);
      await user.type(minInput, "35{Enter}");
      expect(onChange).toHaveBeenLastCalledWith([35, 60]);

      await user.click(screen.getByTestId("max-label"));
      const maxInput = screen.getByTestId("max-label-input");
      await user.clear(maxInput);
      await user.type(maxInput, "85{Enter}");
      expect(onChange).toHaveBeenLastCalledWith([20, 85]);
    });
  });

  describe("keyboard", () => {
    it("moves a handle with the arrow keys", async () => {
      const { user, onChange } = renderNormal({ step: 5 });
      handleMax().focus();
      await user.keyboard("{ArrowRight}");
      expect(onChange).toHaveBeenLastCalledWith([20, 65]);

      handleMin().focus();
      await user.keyboard("{ArrowDown}");
      expect(onChange).toHaveBeenLastCalledWith([15, 60]);
    });

    it("moves one option at a time in fixed mode without crossing", async () => {
      const { user, onChange } = renderFixed([10.99, 10.99]);
      handleMax().focus();
      await user.keyboard("{ArrowRight}");
      expect(onChange).toHaveBeenLastCalledWith([10.99, 30.99]);

      handleMin().focus();
      await user.keyboard("{ArrowRight}");
      expect(onChange).toHaveBeenLastCalledWith([10.99, 10.99]);
    });
  });

  describe("pointer", () => {
    beforeEach(() => {
      mockTrackRect();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("drags a handle until the pointer is released", async () => {
      const { user, onChange } = renderNormal();
      await user.pointer({
        keys: "[MouseLeft>]",
        target: handleMin(),
        coords: { clientX: 20 },
      });
      expect(document.body.style.cursor).toBe("grabbing");

      await user.pointer({ coords: { clientX: 35 } });
      expect(onChange).toHaveBeenLastCalledWith([35, 60]);

      await user.pointer({ keys: "[/MouseLeft]" });
      expect(document.body.style.cursor).toBe("");

      onChange.mockClear();
      await user.pointer({ coords: { clientX: 50 } });
      expect(onChange).not.toHaveBeenCalled();
    });

    it("moves and keeps dragging the closest handle when the track is pressed", async () => {
      const { user, onChange } = renderNormal();
      await user.pointer({
        keys: "[MouseLeft]",
        target: track(),
        coords: { clientX: 90 },
      });
      expect(onChange).toHaveBeenLastCalledWith([20, 90]);

      await user.pointer({
        keys: "[MouseLeft>]",
        target: track(),
        coords: { clientX: 10 },
      });
      expect(onChange).toHaveBeenLastCalledWith([10, 60]);

      await user.pointer({ coords: { clientX: 30 } });
      expect(onChange).toHaveBeenLastCalledWith([30, 60]);
    });

    it("snaps a dragged handle to the closest option in fixed mode", async () => {
      const { user, onChange } = renderFixed();
      await user.pointer({ keys: "[MouseLeft>]", target: handleMax() });
      await user.pointer({ coords: { clientX: 97 } });

      expect(onChange).toHaveBeenLastCalledWith([5.99, 70.99]);
    });
  });
});
