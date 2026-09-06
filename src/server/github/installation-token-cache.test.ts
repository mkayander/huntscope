import assert from "node:assert/strict";
import { describe, it } from "node:test";

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

    assert.equal(getCachedInstallationToken(42), "token-abc");
  });

  it("drops expired tokens", () => {
    clearInstallationTokenCache();
    const expiresAt = new Date(Date.now() - 1_000).toISOString();

    setCachedInstallationToken(7, "expired-token", expiresAt);

    assert.equal(getCachedInstallationToken(7), null);
  });

  it("clears a single installation", () => {
    clearInstallationTokenCache();
    const expiresAt = new Date(Date.now() + 5 * 60_000).toISOString();

    setCachedInstallationToken(1, "one", expiresAt);
    setCachedInstallationToken(2, "two", expiresAt);

    clearInstallationTokenCache(1);

    assert.equal(getCachedInstallationToken(1), null);
    assert.equal(getCachedInstallationToken(2), "two");
  });
});
