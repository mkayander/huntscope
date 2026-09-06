import { describe, expect, it } from "vitest";

import {
  getGitHubStatusMessage,
  getGitHubStatusTitle,
  isGitHubStatusError,
} from "~/lib/github/install-status";

describe("install-status", () => {
  it("classifies success and error statuses", () => {
    expect(isGitHubStatusError("connected")).toBe(false);
    expect(isGitHubStatusError("updated")).toBe(false);
    expect(isGitHubStatusError("already-connected")).toBe(true);
  });

  it("returns user-facing messages and titles", () => {
    expect(getGitHubStatusMessage("connected")).toContain(
      "Repository connected",
    );
    expect(getGitHubStatusTitle("connected")).toBe(
      "GitHub repository connected",
    );
  });

  it("returns undefined for unknown status codes", () => {
    expect(getGitHubStatusMessage("unknown-status")).toBeUndefined();
    expect(getGitHubStatusTitle("unknown-status")).toBe(
      "GitHub connection issue",
    );
  });
});
