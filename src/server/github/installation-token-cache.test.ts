import { describe, expect, it } from "vitest";

import {
  clearInstallationTokenCache,
  getCachedInstallationToken,
  setCachedInstallationToken,
} from "~/server/github/installation-token-cache";

describe("installation token cache", () => {
  it("returns cached tokens before expiry", () => {
    clearInstallationTokenCache();
    const expiresAt = new Date(Date.now() + 5 * 60_000).toISOString();

    setCachedInstallationToken(42, "token-abc", expiresAt);

    expect(getCachedInstallationToken(42)).toBe("token-abc");
  });

  it("drops expired tokens", () => {
    clearInstallationTokenCache();
    const expiresAt = new Date(Date.now() - 1_000).toISOString();

    setCachedInstallationToken(7, "expired-token", expiresAt);

    expect(getCachedInstallationToken(7)).toBeNull();
  });

  it("clears a single installation", () => {
    clearInstallationTokenCache();
    const expiresAt = new Date(Date.now() + 5 * 60_000).toISOString();

    setCachedInstallationToken(1, "one", expiresAt);
    setCachedInstallationToken(2, "two", expiresAt);

    clearInstallationTokenCache(1);

    expect(getCachedInstallationToken(1)).toBeNull();
    expect(getCachedInstallationToken(2)).toBe("two");
  });
});
