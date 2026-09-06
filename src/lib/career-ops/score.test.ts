import { describe, expect, it } from "vitest";

import {
  formatAverageScore,
  getScoreTone,
  parseScore,
} from "~/lib/career-ops/score";

describe("parseScore", () => {
  it("extracts numeric scores from strings", () => {
    expect(parseScore("4.5 / 5")).toBe(4.5);
    expect(parseScore("no score")).toBeNull();
  });
});

describe("getScoreTone", () => {
  it("classifies score bands", () => {
    expect(getScoreTone("4.2")).toBe("high");
    expect(getScoreTone("3.5")).toBe("medium");
    expect(getScoreTone("2.0")).toBe("low");
    expect(getScoreTone("—")).toBe("unknown");
  });
});

describe("formatAverageScore", () => {
  it("formats averages and handles empty input", () => {
    expect(formatAverageScore([4, 3, 5])).toBe("4.0");
    expect(formatAverageScore([])).toBe("—");
  });
});
