import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "../PageHeader";

describe("PageHeader", () => {
  it("renders the breadcrumb, title and description", () => {
    render(
      <PageHeader breadcrumb="Exercise 1" title="Normal Range">
        Drag the handles
      </PageHeader>,
    );

    expect(screen.getByText("Exercise 1")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Normal Range");
    expect(screen.getByText("Drag the handles")).toBeInTheDocument();
  });
});
