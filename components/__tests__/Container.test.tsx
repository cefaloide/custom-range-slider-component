import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Container } from "../Container";

describe("Container", () => {
  it("renders its children inside the main landmark", () => {
    render(<Container>content</Container>);

    expect(screen.getByRole("main").textContent).toBe("content");
  });
});
