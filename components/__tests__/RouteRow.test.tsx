import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RouteRow } from "../RouteRow";

describe("RouteRow", () => {
  it("links page routes with 'Open Route'", () => {
    render(<RouteRow kind="page" href="/exercise1" description="Normal range" />);

    expect(screen.getByText("GET")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Open Route" });
    expect(link).toHaveAttribute("href", "/exercise1");
  });

  it("links API routes with 'View JSON'", () => {
    render(<RouteRow kind="api" href="/api/normal" description="Min and max" />);

    expect(screen.getByText("API")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "View JSON" });
    expect(link).toHaveAttribute("href", "/api/normal");
  });
});
