import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { RangeLabel } from "../RangeLabel";

const renderLabel = (
  overrides: Partial<React.ComponentProps<typeof RangeLabel>> = {},
) => {
  const user = userEvent.setup();
  const onValueCommit = vi.fn();
  render(
    <RangeLabel
      value={20}
      isEditable
      isMinHandle
      minLimit={0}
      maxLimit={100}
      otherHandleValue={60}
      onValueCommit={onValueCommit}
      labelTestId="label"
      inputTestId="input"
      {...overrides}
    />,
  );
  return { user, onValueCommit };
};

// RTL's async wrapper waits on a real setTimeout(0), so fake timers must keep ticking
const useFakeTimers = () => vi.useFakeTimers({ shouldAdvanceTime: true });

const input = () => screen.getByTestId("input") as HTMLInputElement;
const startEditing = (user: UserEvent) =>
  user.click(screen.getByTestId("label"));
const typeValue = async (user: UserEvent, value: string) => {
  await user.clear(input());
  await user.type(input(), value);
};

describe("RangeLabel", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the formatted value", () => {
    renderLabel({ value: 5.5, currency: "$" });
    expect(screen.getByTestId("label").textContent).toBe("5.50$");
  });

  it("is a disabled button when not editable", async () => {
    const { user } = renderLabel({ isEditable: false });
    const label = screen.getByTestId("label") as HTMLButtonElement;
    expect(label.disabled).toBe(true);
    expect(label.getAttribute("aria-label")).toBe("Minimum value 20€");

    await user.click(label);
    expect(screen.queryByTestId("input")).toBeNull();
  });

  it("announces that it can be edited", () => {
    renderLabel({ isMinHandle: false, value: 60, otherHandleValue: 20 });
    expect(screen.getByTestId("label").getAttribute("aria-label")).toBe(
      "Maximum value 60€. Click to edit.",
    );
  });

  it("opens a focused input with the current value on click", async () => {
    const { user } = renderLabel();
    await startEditing(user);

    expect(input().value).toBe("20");
    expect(document.activeElement).toBe(input());
  });

  it("commits a valid value on Enter", async () => {
    const { user, onValueCommit } = renderLabel();
    await startEditing(user);
    await typeValue(user, "45");
    await user.keyboard("{Enter}");

    expect(onValueCommit).toHaveBeenCalledWith(45);
    expect(screen.queryByTestId("input")).toBeNull();
  });

  it("commits on blur", async () => {
    const { user, onValueCommit } = renderLabel();
    await startEditing(user);
    await typeValue(user, "30");
    await user.click(document.body);

    expect(onValueCommit).toHaveBeenCalledWith(30);
  });

  it("commits with the confirm button", async () => {
    const { user, onValueCommit } = renderLabel();
    await startEditing(user);
    await typeValue(user, "10");
    await user.click(screen.getByRole("button", { name: "Confirm value" }));

    expect(onValueCommit).toHaveBeenCalledWith(10);
  });

  it("cancels editing on Escape without committing", async () => {
    const { user, onValueCommit } = renderLabel();
    await startEditing(user);
    await typeValue(user, "45");
    await user.keyboard("{Escape}");

    expect(onValueCommit).not.toHaveBeenCalled();
    expect(screen.getByTestId("label")).toBeTruthy();
  });

  it("shows an error for an invalid value and commits the clamped one later", async () => {
    useFakeTimers();
    const { user, onValueCommit } = renderLabel();
    await startEditing(user);
    await typeValue(user, "80");
    await user.keyboard("{Enter}");

    expect(screen.getByRole("alert").textContent).toBe(
      "Minimum cannot exceed current maximum (60)",
    );
    expect(onValueCommit).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1400));

    expect(onValueCommit).toHaveBeenCalledWith(60);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByTestId("input")).toBeNull();
  });

  it("ignores other keys while editing", async () => {
    const { user, onValueCommit } = renderLabel();
    await startEditing(user);
    await user.keyboard("a");

    expect(onValueCommit).not.toHaveBeenCalled();
    expect(screen.getByTestId("input")).toBeTruthy();
  });

  it.each([
    [true, "min-label", "min-input", "Edit minimum value"],
    [false, "max-label", "max-input", "Edit maximum value"],
  ])(
    "uses default test ids and labels (isMinHandle=%s)",
    async (isMinHandle, labelId, inputId, inputLabel) => {
      const { user } = renderLabel({
        isMinHandle,
        labelTestId: undefined,
        inputTestId: undefined,
      });
      await user.click(screen.getByTestId(labelId));

      expect(screen.getByTestId(inputId).getAttribute("aria-label")).toBe(
        inputLabel,
      );
    },
  );

  it("clears the error while typing", async () => {
    useFakeTimers();
    const { user } = renderLabel();
    await startEditing(user);
    await typeValue(user, "abc");
    await user.keyboard("{Enter}");
    expect(screen.getByRole("alert")).toBeTruthy();

    await user.type(input(), "4");
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
