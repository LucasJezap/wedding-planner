import { beforeEach, describe, expect, it } from "vitest";

import {
  isChunkLoadError,
  markChunkReload,
} from "@/components/chunk-load-recovery";

describe("ChunkLoadRecovery", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("detects chunk loading failures", () => {
    expect(
      isChunkLoadError(
        "ChunkLoadError: Loading chunk failed for /_next/static/chunks/app.js",
      ),
    ).toBe(true);
    expect(
      isChunkLoadError(
        new Error("Failed to fetch dynamically imported module"),
      ),
    ).toBe(true);
    expect(isChunkLoadError(new Error("Random runtime failure"))).toBe(false);
  });

  it("marks reload once per route and clears repeated attempts", () => {
    const marker = `${window.location.pathname}${window.location.search}`;

    expect(markChunkReload(window.sessionStorage, marker)).toBe(true);
    expect(window.sessionStorage.getItem("chunk-load-recovery")).toBe(marker);

    expect(markChunkReload(window.sessionStorage, marker)).toBe(false);
    expect(window.sessionStorage.getItem("chunk-load-recovery")).toBeNull();
  });
});
