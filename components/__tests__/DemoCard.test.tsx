import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DemoCard } from "../DemoCard";

const renderCard = (isLoading: boolean, error: string | null) => {
  const onRetry = vi.fn();
  render(
    <DemoCard isLoading={isLoading} error={error} onRetry={onRetry}>
      demo
    </DemoCard>,
  );
  return { onRetry };
};

describe("DemoCard", () => {
  it("renders children once loaded", () => {
    renderCard(false, null);

    expect(screen.getByText("demo")).toBeInTheDocument();
  });

  it("hides children while loading", () => {
    renderCard(true, null);

    expect(screen.queryByText("demo")).not.toBeInTheDocument();
  });

  it("shows the error and retries on click", async () => {
    const user = userEvent.setup();
    const { onRetry } = renderCard(false, "Failed to load");

    expect(screen.getByRole("alert").textContent).toBe("Failed to load");
    expect(screen.queryByText("demo")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
