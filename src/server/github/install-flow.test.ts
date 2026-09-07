import { describe, expect, it } from "vitest";

import { shouldAttemptInstallationSync } from "~/server/github/install-flow";

describe("shouldAttemptInstallationSync", () => {
  it("syncs only when no connection cookie exists", () => {
    expect(shouldAttemptInstallationSync(null)).toBe(true);
    expect(shouldAttemptInstallationSync(undefined)).toBe(true);
    expect(
      shouldAttemptInstallationSync({
        installationId: 1,
        userId: "user-1",
        repositories: [],
        connectedAt: "2026-01-01T00:00:00.000Z",
      }),
    ).toBe(false);
  });
});
