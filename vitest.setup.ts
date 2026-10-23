import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Unmount rendered trees between tests (no Vitest globals, so RTL can't do it itself)
afterEach(() => {
  cleanup();
});
