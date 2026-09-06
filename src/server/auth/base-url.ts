import { env } from "~/env";

export function getBetterAuthBaseUrl(): string | undefined {
  if (env.BETTER_AUTH_URL) {
    return env.BETTER_AUTH_URL;
  }

  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionUrl) {
    return `https://${productionUrl}`;
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  return undefined;
}
