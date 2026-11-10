import { describe, expect, it } from "vitest";

import {
  normalizeApplicationHeaderLabel,
  resolveApplicationHeaderKey,
} from "~/lib/career-ops/application-header-aliases";

describe("application header aliases", () => {
  it("maps Spanish and English variant headers", () => {
    expect(resolveApplicationHeaderKey("Empresa")).toBe("company");
    expect(resolveApplicationHeaderKey("Puesto")).toBe("role");
    expect(resolveApplicationHeaderKey("Estado")).toBe("status");
    expect(resolveApplicationHeaderKey("Position")).toBe("role");
    expect(resolveApplicationHeaderKey("Stage")).toBe("status");
    expect(resolveApplicationHeaderKey("Link")).toBe("url");
  });

  it("normalizes a hash column", () => {
    expect(normalizeApplicationHeaderLabel("#")).toBe("num");
    expect(resolveApplicationHeaderKey("#")).toBe("num");
  });
});
