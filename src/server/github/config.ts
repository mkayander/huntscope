import { createHash } from "node:crypto";

import { env } from "~/env";

export function isGitHubOAuthConfigured() {
  return Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET);
}

export function isGitHubAppConfigured() {
  return Boolean(
    env.GITHUB_APP_ID &&
      env.GITHUB_APP_PRIVATE_KEY &&
      env.GITHUB_APP_SLUG,
  );
}

export function isGitHubConfigured() {
  return isGitHubOAuthConfigured() && isGitHubAppConfigured();
}

export function requireGitHubOAuthConfig() {
  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.",
    );
  }

  return {
    clientId,
    clientSecret,
  };
}

export function requireGitHubAppConfig() {
  const appId = env.GITHUB_APP_ID;
  const privateKey = env.GITHUB_APP_PRIVATE_KEY;
  const slug = env.GITHUB_APP_SLUG;

  if (!appId || !privateKey || !slug) {
    throw new Error(
      "GitHub App is not configured. Set GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY, and GITHUB_APP_SLUG.",
    );
  }

  return {
    appId,
    privateKey,
    slug,
  };
}

export function getCookieEncryptionKey() {
  const secret = env.BETTER_AUTH_SECRET;

  if (!secret) {
    throw new Error(
      "BETTER_AUTH_SECRET is required to store GitHub installation cookies.",
    );
  }

  return createHash("sha256").update(secret).digest();
}
