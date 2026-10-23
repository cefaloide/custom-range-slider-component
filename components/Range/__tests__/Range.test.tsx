import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
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

    it("hides the bounds header when showBounds is false", () => {
      renderNormal({ showBounds: false });
      expect(screen.queryByTestId("range-bounds-header")).toBeNull();
    });

    it("shows the current values in the labels", () => {
      renderNormal();
      expect(screen.getByTestId("min-label").textContent).toBe("20€");
      expect(screen.getByTestId("max-label").textContent).toBe("60€");
    });

    it("clamps values outside the limits", () => {
      renderNormal({ value: [-5, 500] });
      expect(screen.getByTestId("min-label").textContent).toBe("0€");
      expect(screen.getByTestId("max-label").textContent).toBe("100€");
    });

    it("positions the handles and the highlight", () => {
      renderNormal();
      expect(handleMin().style.left).toBe("20%");
      expect(handleMax().style.left).toBe("60%");

      const highlight = screen.getByTestId("range-highlight");
      expect(highlight.style.left).toBe("20%");
      expect(highlight.style.width).toBe("40%");
    });

    it("exposes slider semantics on the handles", () => {
      renderNormal({ ariaLabelMin: "From", ariaLabelMax: "To" });
      const [min, max] = screen.getAllByRole("slider");

      expect(min.getAttribute("aria-label")).toBe("From");
      expect(min.getAttribute("aria-valuemin")).toBe("0");
      expect(min.getAttribute("aria-valuemax")).toBe("60");
      expect(min.getAttribute("aria-valuenow")).toBe("20");

      expect(max.getAttribute("aria-label")).toBe("To");
      expect(max.getAttribute("aria-valuemin")).toBe("20");
      expect(max.getAttribute("aria-valuemax")).toBe("100");
      expect(max.getAttribute("aria-valuenow")).toBe("60");
    });

    it("positions handles by option index in fixed mode", () => {
      renderFixed();
      expect(handleMin().style.left).toBe("20%");
      expect(handleMax().style.left).toBe("60%");
      expect(screen.getByTestId("range-bounds-header").textContent).toContain(
        "Max 70.99€",
      );
    });

    it("does not allow label editing in fixed mode", () => {
      renderFixed();
      expect(
        (screen.getByTestId("min-label") as HTMLButtonElement).disabled,
      ).toBe(true);
      expect(
        (screen.getByTestId("max-label") as HTMLButtonElement).disabled,
      ).toBe(true);
    });
  });

  describe("label editing", () => {
    it("commits an edited min value through onChange", async () => {
      const { user, onChange } = renderNormal();
      await user.click(screen.getByTestId("min-label"));
      const input = screen.getByTestId("min-label-input");
      await user.clear(input);
      await user.type(input, "35{Enter}");

      expect(onChange).toHaveBeenCalledWith([35, 60]);
    });

    it("commits an edited max value through onChange", async () => {
      const { user, onChange } = renderNormal();
      await user.click(screen.getByTestId("max-label"));
      const input = screen.getByTestId("max-label-input");
      await user.clear(input);
      await user.type(input, "85{Enter}");

      expect(onChange).toHaveBeenCalledWith([20, 85]);
    });

    it("disables editing when allowLabelEdit is false", () => {
      renderNormal({ allowLabelEdit: false });
      expect(
        (screen.getByTestId("max-label") as HTMLButtonElement).disabled,
      ).toBe(true);
    });
  });

  describe("keyboard", () => {
    it("moves a handle with the arrow keys", async () => {
      const { user, onChange } = renderNormal({ step: 5 });
      handleMax().focus();
      await user.keyboard("{ArrowRight}");
      expect(onChange).toHaveBeenLastCalledWith([20, 65]);

      handleMin().focus();
      await user.keyboard("{ArrowLeft}");
      expect(onChange).toHaveBeenLastCalledWith([15, 60]);
    });

    it("moves to the next option in fixed mode", async () => {
      const { user, onChange } = renderFixed();
      handleMax().focus();
      await user.keyboard("{ArrowRight}");
      expect(onChange).toHaveBeenLastCalledWith([5.99, 50.99]);
    });

    it("does not let the min handle pass the max handle", async () => {
      const { user, onChange } = renderFixed([10.99, 10.99]);
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

    it("stops dragging on pointercancel", async () => {
      const { user, onChange } = renderNormal();
      await user.pointer({ keys: "[MouseLeft>]", target: handleMax() });
      // user-event has no API for pointercancel (the browser fires it, not the user)
      fireEvent.pointerCancel(window);

      await user.pointer({ coords: { clientX: 90 } });
      expect(onChange).not.toHaveBeenCalled();
    });

    it("moves the closest handle when the track is clicked", async () => {
      const { user, onChange } = renderNormal();

      await user.pointer({
        keys: "[MouseLeft]",
        target: track(),
        coords: { clientX: 90 },
      });
      expect(onChange).toHaveBeenLastCalledWith([20, 90]);

      await user.pointer({
        keys: "[MouseLeft]",
        target: track(),
        coords: { clientX: 5 },
      });
      expect(onChange).toHaveBeenLastCalledWith([5, 60]);
    });

    it("keeps dragging the handle picked by a track click", async () => {
      const { user, onChange } = renderNormal();
      await user.pointer({
        keys: "[MouseLeft>]",
        target: track(),
        coords: { clientX: 10 },
      });
      await user.pointer({ coords: { clientX: 30 } });

      expect(onChange).toHaveBeenLastCalledWith([30, 60]);
    });

    it("ignores track clicks while a handle is being dragged", async () => {
      const { user, onChange } = renderNormal();
      await user.pointer({ keys: "[MouseLeft>]", target: handleMax() });
      // A second finger touching the track mid-drag
      await user.pointer({
        keys: "[TouchA>]",
        target: track(),
        coords: { clientX: 5 },
      });

      expect(onChange).not.toHaveBeenCalled();
    });

    it("treats a track without width as position 0", async () => {
      vi.restoreAllMocks();
      mockTrackRect(0);
      const { user, onChange } = renderNormal();
      await user.pointer({
        keys: "[MouseLeft>]",
        target: track(),
        coords: { clientX: 50 },
      });

      expect(onChange).toHaveBeenLastCalledWith([0, 60]);
    });

    it("snaps a dragged handle to the closest option in fixed mode", async () => {
      const { user, onChange } = renderFixed();
      await user.pointer({ keys: "[MouseLeft>]", target: handleMax() });
      await user.pointer({ coords: { clientX: 97 } });

      expect(onChange).toHaveBeenLastCalledWith([5.99, 70.99]);
    });
  });
});
