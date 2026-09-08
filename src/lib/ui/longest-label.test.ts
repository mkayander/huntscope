import { describe, expect, it } from "vitest";

import { longestLabel } from "~/lib/ui/longest-label";

describe("longestLabel", () => {
  it("returns the longest label string", () => {
    expect(
      longestLabel(["Disconnect", "Disconnecting…", "Change repository"]),
    ).toBe("Change repository");
  });

  it("returns an empty string for an empty list", () => {
    expect(longestLabel([])).toBe("");
  });
});
