import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Navbar } from "../NavBar";
import { NAV_LINKS, ROUTES } from "@/lib/routes";

vi.mock("next/navigation", () => ({
  usePathname: () => ROUTES.exercise1.href,
}));

describe("Navbar", () => {
  it("renders a link for every route", () => {
    render(<Navbar />);

    for (const { href, navLabel } of NAV_LINKS) {
      const link = screen.getByRole("link", { name: navLabel });
      expect(link).toHaveAttribute("href", href);
    }
  });

  it("highlights only the link of the current path", () => {
    render(<Navbar />);

    const active = screen.getByRole("link", { name: ROUTES.exercise1.navLabel });
    const inactive = screen.getByRole("link", { name: ROUTES.home.navLabel });
    expect(active).toHaveClass("bg-black");
    expect(inactive).not.toHaveClass("bg-black");
  });
});
