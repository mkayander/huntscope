import { describe, expect, it, vi } from "vitest";

import { resolveDashboardShortcutAction } from "~/lib/dashboard/shortcut-actions";

function createEvent(
  overrides: Partial<{
    key: string;
    metaKey: boolean;
    ctrlKey: boolean;
    tagName: string;
    isContentEditable: boolean;
  }> = {},
) {
  const preventDefault = vi.fn();

  return {
    event: {
      key: overrides.key ?? "k",
      metaKey: overrides.metaKey ?? false,
      ctrlKey: overrides.ctrlKey ?? false,
      target: {
        tagName: overrides.tagName ?? "BODY",
        isContentEditable: overrides.isContentEditable ?? false,
      },
      preventDefault,
    },
    preventDefault,
  };
}

describe("resolveDashboardShortcutAction", () => {
  it("focuses search on ctrl+k outside editable fields", () => {
    const { event, preventDefault } = createEvent({ ctrlKey: true });

    expect(resolveDashboardShortcutAction(event, false)).toBe("focus-search");
    expect(preventDefault).toHaveBeenCalledOnce();
  });

  it("does not steal ctrl+k while typing in inputs", () => {
    const { event, preventDefault } = createEvent({
      ctrlKey: true,
      tagName: "INPUT",
    });

    expect(resolveDashboardShortcutAction(event, false)).toBeNull();
    expect(preventDefault).not.toHaveBeenCalled();
  });

  it("closes artifact preview on escape", () => {
    const { event, preventDefault } = createEvent({ key: "Escape" });

    expect(resolveDashboardShortcutAction(event, true)).toBe("close-artifact");
    expect(preventDefault).toHaveBeenCalledOnce();
  });

  it("closes artifact preview from inputs on escape", () => {
    const { event, preventDefault } = createEvent({
      key: "Escape",
      tagName: "INPUT",
    });

    expect(resolveDashboardShortcutAction(event, true)).toBe("close-artifact");
    expect(preventDefault).toHaveBeenCalledOnce();
  });
});
