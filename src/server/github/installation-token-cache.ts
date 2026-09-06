type CachedInstallationToken = {
  token: string;
  expiresAtMs: number;
};

const tokenCache = new Map<number, CachedInstallationToken>();

const EXPIRY_BUFFER_MS = 60_000;

export function getCachedInstallationToken(
  installationId: number,
): string | null {
  const cached = tokenCache.get(installationId);
  if (!cached) {
    return null;
  }

  if (cached.expiresAtMs <= Date.now() + EXPIRY_BUFFER_MS) {
    tokenCache.delete(installationId);
    return null;
  }

  return cached.token;
}

export function setCachedInstallationToken(
  installationId: number,
  token: string,
  expiresAt: string,
): void {
  const expiresAtMs = Date.parse(expiresAt);

  if (Number.isNaN(expiresAtMs)) {
    return;
  }

  tokenCache.set(installationId, { token, expiresAtMs });
}

export function clearInstallationTokenCache(installationId?: number): void {
  if (installationId === undefined) {
    tokenCache.clear();
    return;
  }

  tokenCache.delete(installationId);
}
