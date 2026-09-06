import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

import { env } from "~/env";
import { getBetterAuthBaseUrl } from "~/server/auth/base-url";
import {
  isGitHubOAuthConfigured,
  requireGitHubOAuthConfig,
} from "~/server/github/config";

const githubOAuth = isGitHubOAuthConfigured()
  ? requireGitHubOAuthConfig()
  : null;

export const auth = betterAuth({
  baseURL: getBetterAuthBaseUrl(),
  secret: env.BETTER_AUTH_SECRET,
  socialProviders: githubOAuth
    ? {
        github: {
          clientId: githubOAuth.clientId,
          clientSecret: githubOAuth.clientSecret,
        },
      }
    : {},
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 7 * 24 * 60 * 60,
      strategy: "jwe",
      refreshCache: true,
    },
  },
  account: {
    storeStateStrategy: "cookie",
    storeAccountCookie: true,
  },
  plugins: [nextCookies()],
});
