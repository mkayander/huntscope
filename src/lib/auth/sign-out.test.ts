import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { performSignOut } from "~/lib/auth/sign-out";
import { authClient } from "~/lib/auth-client";
import { clearGitHubViewState } from "~/lib/auth/sign-out-cleanup";

vi.mock("~/lib/auth-client", () => ({
  authClient: {
    signOut: vi.fn(),
  },
}));

vi.mock("~/lib/auth/sign-out-cleanup", () => ({
  clearGitHubViewState: vi.fn(),
}));

describe("performSignOut", () => {
  beforeEach(() => {
    vi.mocked(authClient.signOut).mockReset();
    vi.mocked(clearGitHubViewState).mockReset();
    vi.mocked(clearGitHubViewState).mockResolvedValue(undefined);
  });

  it("returns an error when sign-out fails", async () => {
    vi.mocked(authClient.signOut).mockResolvedValue({
      error: { message: "Network error" },
    } as never);

    const result = await performSignOut({
      queryClient: new QueryClient(),
    });

    expect(result).toEqual({ ok: false, errorMessage: "Network error" });
    expect(clearGitHubViewState).not.toHaveBeenCalled();
  });

  it("clears GitHub cache when requested", async () => {
    vi.mocked(authClient.signOut).mockResolvedValue({ error: null } as never);
    const queryClient = new QueryClient();
    const clearGitHubInstallStatus = vi.fn();

    const result = await performSignOut({
      queryClient,
      clearGitHubInstallStatus,
      clearGitHubCache: true,
    });

    expect(result).toEqual({ ok: true });
    expect(clearGitHubInstallStatus).toHaveBeenCalledOnce();
    expect(clearGitHubViewState).toHaveBeenCalledWith(queryClient);
  });

  it("skips GitHub cache cleanup by default", async () => {
    vi.mocked(authClient.signOut).mockResolvedValue({ error: null } as never);

    const result = await performSignOut({
      queryClient: new QueryClient(),
    });

    expect(result).toEqual({ ok: true });
    expect(clearGitHubViewState).not.toHaveBeenCalled();
  });
});
