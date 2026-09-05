#!/usr/bin/env bash
# Cloud Agent install: idempotent dependency + local-env bootstrap for Huntscope.
set -euo pipefail

cd "$(dirname "$0")/.."

corepack enable >/dev/null 2>&1 || true
pnpm install --frozen-lockfile

# Ensure the app can boot without interactive setup. Real credentials provided as
# Cursor secrets (environment variables) always take precedence over these dev
# placeholders, since Next.js does not override values already present in the
# environment. Only create .env when it is missing so re-runs are idempotent.
if [ ! -f .env ]; then
  echo "No .env found — generating a development .env with placeholder credentials."
  cp .env.example .env
  secret="$(openssl rand -base64 32)"
  # Fill BETTER_AUTH_SECRET and non-empty GitHub placeholders so env validation
  # passes and the dev server boots. GitHub OAuth requires real credentials.
  sed -i \
    -e "s|^BETTER_AUTH_SECRET=.*|BETTER_AUTH_SECRET=\"${secret}\"|" \
    -e "s|^GITHUB_CLIENT_ID=.*|GITHUB_CLIENT_ID=\"dev-placeholder-client-id\"|" \
    -e "s|^GITHUB_CLIENT_SECRET=.*|GITHUB_CLIENT_SECRET=\"dev-placeholder-client-secret\"|" \
    .env
fi
