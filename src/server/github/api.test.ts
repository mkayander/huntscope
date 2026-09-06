import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getAppInstallationForUser,
  getGitHubUserProfile,
  verifyUserCanAccessInstallation,
} from "~/server/github/api";

vi.mock("~/server/github/app-auth", () => ({
  createGitHubAppJwt: vi.fn().mockResolvedValue("app-jwt"),
}));

describe("getGitHubUserProfile", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads the signed-in GitHub user", async () => {
    vi.stubGlobal(
      "fetch",

      vi.fn().mockResolvedValue({
        ok: true,

        json: async () => ({ id: 42, login: "octocat" }),
      }),
    );

    await expect(getGitHubUserProfile("user-token")).resolves.toEqual({
      id: 42,

      login: "octocat",
    });
  });
});

describe("getAppInstallationForUser", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses the app installation lookup endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,

      json: async () => ({
        id: 123,

        app_id: 999,

        app_slug: "huntscope",

        account: { id: 42, login: "octocat", type: "User" },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(getAppInstallationForUser("octocat")).resolves.toMatchObject({
      id: 123,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.github.com/users/octocat/installation",

      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer app-jwt",
        }),
      }),
    );
  });

  it("returns null when the user has no app installation", async () => {
    vi.stubGlobal(
      "fetch",

      vi.fn().mockResolvedValue({
        ok: false,

        status: 404,

        text: async () => "Not Found",
      }),
    );

    await expect(getAppInstallationForUser("octocat")).resolves.toBeNull();
  });
});

describe("verifyUserCanAccessInstallation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("matches personal account installations by login", async () => {
    vi.stubGlobal(
      "fetch",

      vi.fn().mockResolvedValue({
        ok: true,

        json: async () => ({
          id: 123,

          app_id: 999,

          app_slug: "huntscope",

          account: { id: 42, login: "octocat", type: "User" },
        }),
      }),
    );

    await expect(
      verifyUserCanAccessInstallation(123, "octocat", "user-token"),
    ).resolves.toBe(true);
  });

  it("rejects personal account installations for a different login", async () => {
    vi.stubGlobal(
      "fetch",

      vi.fn().mockResolvedValue({
        ok: true,

        json: async () => ({
          id: 123,

          app_id: 999,

          app_slug: "huntscope",

          account: { id: 42, login: "octocat", type: "User" },
        }),
      }),
    );

    await expect(
      verifyUserCanAccessInstallation(123, "other-user", "user-token"),
    ).resolves.toBe(false);
  });
});
