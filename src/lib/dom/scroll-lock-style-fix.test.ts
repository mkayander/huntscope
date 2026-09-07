import { describe, expect, it, vi } from "vitest";

import {
  SCROLL_LOCK_FIX_CSS,
  applyScrollLockBodyStyles,
  clearScrollLockBodyStyles,
} from "~/lib/dom/scroll-lock-style-fix";

describe("scroll-lock-style-fix", () => {
  it("includes overrides for react-remove-scroll compensation", () => {
    expect(SCROLL_LOCK_FIX_CSS).toContain(
      "--removed-body-scroll-bar-size: 0px",
    );
    expect(SCROLL_LOCK_FIX_CSS).toContain(".right-scroll-bar-position");
    expect(SCROLL_LOCK_FIX_CSS).toContain(".width-before-scroll-bar");
  });

  it("clears compensating body styles when unlocked", () => {
    const body = {
      attributes: new Map<string, string>(),
      style: {
        properties: new Map<string, string>(),
        setProperty(name: string, value: string, priority?: string) {
          this.properties.set(name, priority ? `${value} !important` : value);
        },
        removeProperty(name: string) {
          this.properties.delete(name);
        },
      },
      hasAttribute(name: string) {
        return this.attributes.has(name);
      },
      setAttribute(name: string) {
        this.attributes.set(name, "");
      },
      removeAttribute(name: string) {
        this.attributes.delete(name);
      },
    };

    vi.stubGlobal("document", { body });

    body.setAttribute("data-scroll-locked");
    applyScrollLockBodyStyles();
    expect(body.style.properties.get("padding-right")).toBe("0 !important");

    clearScrollLockBodyStyles();
    expect(body.style.properties.has("padding-right")).toBe(false);

    vi.unstubAllGlobals();
  });
});
