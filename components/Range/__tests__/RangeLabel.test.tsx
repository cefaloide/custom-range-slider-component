import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
      {...overrides}
    />,
  );
  return { user, onValueCommit };
};

const label = () => screen.getByRole("button", { name: /value/ });
const input = () => screen.getByRole("textbox") as HTMLInputElement;
const startEditing = (user: UserEvent) => user.click(label());
const typeValue = async (user: UserEvent, value: string) => {
  await user.clear(input());
  await user.type(input(), value);
};

describe("RangeLabel", () => {
  it("opens a focused input and commits a valid value on Enter", async () => {
    const { user, onValueCommit } = renderLabel();
    expect(label().getAttribute("aria-label")).toBe(
      "Minimum value 20€. Click to edit.",
    );

    await startEditing(user);
    expect(input().value).toBe("20");
    expect(document.activeElement).toBe(input());

    await typeValue(user, "45");
    await user.keyboard("{Enter}");
    expect(onValueCommit).toHaveBeenCalledWith(45);
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("shows an error for an invalid value until it is fixed", async () => {
    const { user, onValueCommit } = renderLabel();
    await startEditing(user);
    await typeValue(user, "80");
    await user.keyboard("{Enter}");

    expect(screen.getByRole("alert").textContent).toBe(
      "Minimum cannot exceed current maximum (60)",
    );
    expect(onValueCommit).not.toHaveBeenCalled();

    await typeValue(user, "45");
    expect(screen.queryByRole("alert")).toBeNull();
    await user.keyboard("{Enter}");

    expect(onValueCommit).toHaveBeenCalledTimes(1);
    expect(onValueCommit).toHaveBeenCalledWith(45);
  });

  it("cancels editing on Escape, discarding any error", async () => {
    const { user, onValueCommit } = renderLabel();
    await startEditing(user);
    await typeValue(user, "80");
    await user.keyboard("{Enter}");
    await user.keyboard("{Escape}");

    expect(onValueCommit).not.toHaveBeenCalled();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(label()).toBeTruthy();
  });
});
