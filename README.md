# Huntscope

Analytics dashboard for your private job-search repository on GitHub.

Huntscope connects to a companion data repo (for example a career-ops-style layout with `data/applications.md`, `data/pipeline.md`, and `reports/`) and turns it into charts, tables, and funnel views — without replacing the repo as the source of truth.

## Stack

- [Next.js](https://nextjs.org) 15 (App Router)
- [Better Auth](https://www.better-auth.com) — stateless GitHub OAuth (encrypted cookies, no database)
- [tRPC](https://trpc.io) + [Tailwind CSS](https://tailwindcss.com)

## Auth model

Huntscope uses a two-step GitHub integration:

1. **Sign in (OAuth App)** — requests only `read:user` and `user:email`. Users are not asked to grant access to every private repository.
2. **Connect repository (GitHub App)** — users install the Huntscope GitHub App on **selected repositories only**. Huntscope receives read-only access to the repo they pick.

Sessions and installation metadata are stored in **encrypted cookies (JWE)** — no Postgres or KV required for MVP.

## GitHub setup

### 1. OAuth App (sign-in)

Create an OAuth App at [GitHub Developer Settings](https://github.com/settings/developers).

| Setting | Value |
|---------|-------|
| Callback URL | `http://localhost:3000/api/auth/callback/github` |
| Scopes | Default (`read:user`, `user:email`) — do **not** request `repo` |

### 2. GitHub App (repository access)

Create a GitHub App at [GitHub Developer Settings → GitHub Apps](https://github.com/settings/apps).

| Setting | Value |
|---------|-------|
| Homepage URL | `http://localhost:3000` |
| Setup URL | `http://localhost:3000/api/github/install/callback` |
| Repository permissions | **Contents: Read-only** |
| Where can this app be installed? | Any account |

After creating the app:

1. Generate a private key and download it.
2. Note the **App ID**.
3. Note the app **slug** from the public install URL (`https://github.com/apps/<slug>`).

Users connect a repo from the Huntscope UI. GitHub shows **Only select repositories**, so they grant access to exactly one companion repo.

## Getting started

```bash
pnpm install
cp .env.example .env
# Fill BETTER_AUTH_SECRET (openssl rand -base64 32), OAuth credentials, and GitHub App values
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm check` | Lint + typecheck |

## Deploy (Vercel)

Set these in **Project → Settings → Environment Variables** (Production, Preview, Development):

| Variable | Notes |
|----------|-------|
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | `https://<your-vercel-domain>` |
| `GITHUB_CLIENT_ID` | OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | OAuth app client secret |
| `GITHUB_APP_ID` | GitHub App ID |
| `GITHUB_APP_PRIVATE_KEY` | PEM private key; use `\n` for newlines in Vercel |
| `GITHUB_APP_SLUG` | App slug from `https://github.com/apps/<slug>` |

GitHub callbacks:

- OAuth: `https://<your-vercel-domain>/api/auth/callback/github`
- GitHub App setup: `https://<your-vercel-domain>/api/github/install/callback`

## License

Private — not affiliated with career-ops or any third-party job-search tooling.
