import { describe, expect, it } from "vitest";

import { readDashboardHeaderScrollOffset } from "~/lib/dashboard/header-height";

describe("readDashboardHeaderScrollOffset", () => {
  it("returns fallback when css variable is unavailable", () => {
    expect(readDashboardHeaderScrollOffset(120, 8)).toBe(120);
  });
});
