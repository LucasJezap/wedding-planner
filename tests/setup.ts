import "@testing-library/jest-dom/vitest";

import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

import { resetPlannerStore } from "@/db/repositories/memory-planner-repository";

beforeEach(() => {
  process.env.APP_DATA_MODE = "memory";
  resetPlannerStore();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);
vi.stubGlobal("confirm", () => true);
