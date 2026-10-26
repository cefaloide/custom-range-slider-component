import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ButtonLink } from "../ButtonLink";

describe("ButtonLink", () => {
  it("renders a link with its label and href", () => {
    render(<ButtonLink href="/exercise1">Start</ButtonLink>);

    const link = screen.getByRole("link", { name: "Start" });
    expect(link).toHaveAttribute("href", "/exercise1");
  });
});
