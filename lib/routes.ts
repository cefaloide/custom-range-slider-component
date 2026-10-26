export const ROUTES = {
  home: { href: "/", navLabel: "Home" },
  exercise1: {
    href: "/exercise1",
    navLabel: "Exercise 1: Normal Range",
    name: "Normal Range",
  },
  exercise2: {
    href: "/exercise2",
    navLabel: "Exercise 2: Fixed Values",
    name: "Fixed Values Range",
  },
} as const;

export const NAV_LINKS = [ROUTES.home, ROUTES.exercise1, ROUTES.exercise2];
