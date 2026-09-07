import { describe, expect, it, vi } from "vitest";

import { acquireBodyScrollLock } from "~/lib/dom/body-scroll-lock";

describe("acquireBodyScrollLock", () => {
  it("locks and unlocks the body attribute with ref counting", () => {
    const body = {
      attributes: new Map<string, string>(),
      setAttribute(name: string) {
        this.attributes.set(name, "");
      },
      removeAttribute(name: string) {
        this.attributes.delete(name);
      },
      hasAttribute(name: string) {
        return this.attributes.has(name);
      },
    };

    vi.stubGlobal("document", { body });

    const releaseA = acquireBodyScrollLock();
    const releaseB = acquireBodyScrollLock();

    expect(body.hasAttribute("data-overlay-scroll-locked")).toBe(true);

    releaseA();
    expect(body.hasAttribute("data-overlay-scroll-locked")).toBe(true);

    releaseB();
    expect(body.hasAttribute("data-overlay-scroll-locked")).toBe(false);

    vi.unstubAllGlobals();
  });
});
