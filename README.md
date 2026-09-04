# Huntscope

Analytics dashboard for your private job-search repository on GitHub.

Huntscope connects to a companion data repo (for example a career-ops-style layout with `data/applications.md`, `data/pipeline.md`, and `reports/`) and turns it into charts, tables, and funnel views — without replacing the repo as the source of truth.

## Stack

- [Next.js](https://nextjs.org) 15 (App Router)
- [Better Auth](https://www.better-auth.com) — stateless GitHub OAuth (encrypted cookies, no database)
- [tRPC](https://trpc.io) + [Tailwind CSS](https://tailwindcss.com)

## Auth model

Sessions and GitHub OAuth tokens are stored in **encrypted cookies (JWE)** — no Postgres or KV required for MVP. GitHub is requested with `repo` scope so Huntscope can read private companion repos via the API.

## Getting started

```bash
pnpm install
cp .env.example .env
# Fill BETTER_AUTH_SECRET (openssl rand -base64 32), GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
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
|----------|--------|
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | `https://<your-vercel-domain>` (optional on Vercel — inferred from deployment URL) |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret |

GitHub OAuth callback URL:

`https://<your-vercel-domain>/api/auth/callback/github`

## License

Private — not affiliated with career-ops or any third-party job-search tooling.
