import { afterEach, describe, expect, it, vi } from "vitest";

import {
  bindVisualViewportHeight,
  readVisualViewportHeight,
  syncVisualViewportHeight,
  VISUAL_VIEWPORT_HEIGHT_VAR,
} from "~/lib/dom/visual-viewport-height";

function createStyleRecord() {
  const values = new Map<string, string>();

  return {
    setProperty(name: string, value: string) {
      values.set(name, value);
    },
    removeProperty(name: string) {
      values.delete(name);
    },
    getPropertyValue(name: string) {
      return values.get(name) ?? "";
    },
  };
}

describe("readVisualViewportHeight", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("prefers visualViewport.height when available", () => {
    vi.stubGlobal("window", {
      innerHeight: 812,
      visualViewport: { height: 703 },
    });

    expect(readVisualViewportHeight()).toBe(703);
  });

  it("falls back to innerHeight when visualViewport is unavailable", () => {
    vi.stubGlobal("window", {
      innerHeight: 812,
      visualViewport: undefined,
    });

    expect(readVisualViewportHeight()).toBe(812);
  });
});

describe("syncVisualViewportHeight", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("writes the current visual viewport height to the root element", () => {
    vi.stubGlobal("window", {
      innerHeight: 812,
      visualViewport: { height: 640 },
    });

    const style = createStyleRecord();
    syncVisualViewportHeight({ style } as HTMLElement);

    expect(style.getPropertyValue(VISUAL_VIEWPORT_HEIGHT_VAR)).toBe("640px");
  });
});

describe("bindVisualViewportHeight", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("cleans up listeners and removes the css variable", () => {
    const resize = vi.fn();
    const scroll = vi.fn();
    const style = createStyleRecord();

    vi.stubGlobal("window", {
      innerHeight: 812,
      visualViewport: {
        height: 640,
        addEventListener: vi.fn((event, listener) => {
          if (event === "resize") {
            resize.mockImplementation(listener as () => void);
          }
          if (event === "scroll") {
            scroll.mockImplementation(listener as () => void);
          }
        }),
        removeEventListener: vi.fn(),
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });

    const cleanup = bindVisualViewportHeight({ style } as HTMLElement);

    expect(style.getPropertyValue(VISUAL_VIEWPORT_HEIGHT_VAR)).toBe("640px");

    cleanup();

    expect(style.getPropertyValue(VISUAL_VIEWPORT_HEIGHT_VAR)).toBe("");
  });
});
