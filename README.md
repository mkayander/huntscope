# Huntscope

Analytics dashboard for your private job-search repository on GitHub.

Huntscope connects to a companion data repo (for example a career-ops-style layout with `data/applications.md`, `data/pipeline.md`, and `reports/`) and turns it into charts, tables, and funnel views — without replacing the repo as the source of truth.

## Stack

Built with the [T3 Stack](https://create.t3.gg/):

- [Next.js](https://nextjs.org) (App Router)
- [NextAuth.js](https://next-auth.js.org) — GitHub OAuth
- [Drizzle ORM](https://orm.drizzle.team) + Postgres
- [tRPC](https://trpc.io)
- [Tailwind CSS](https://tailwindcss.com)

## MVP direction

1. **Read-only** — GitHub repo remains canonical; Huntscope reads via the GitHub API.
2. **Auth** — Sign in with GitHub; connect one or more private repos.
3. **Visuals** — Tracker tables, pipeline funnel, score trends (D3 later).
4. **Deploy** — Vercel + Vercel Postgres for session/connection metadata only.

Phase 2: optional BYOK AI over repo context.

## Getting started

```bash
pnpm install
cp .env.example .env   # fill in DATABASE_URL, AUTH_SECRET, AUTH_GITHUB_ID, AUTH_GITHUB_SECRET
./start-database.sh    # local Postgres via Docker (optional)
pnpm db:push
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm check` | Lint + typecheck |
| `pnpm db:push` | Push Drizzle schema to database |
| `pnpm db:studio` | Open Drizzle Studio |

## Deploy (Vercel)

The T3 env validator runs during `next build`. **All variables below must be set in Vercel → Project → Settings → Environment Variables** (Production, Preview, and Development) before the build will succeed.

| Variable | Notes |
|----------|--------|
| `AUTH_SECRET` | `npx auth secret` |
| `AUTH_GITHUB_ID` | GitHub OAuth app client ID |
| `AUTH_GITHUB_SECRET` | GitHub OAuth app client secret |
| `DATABASE_URL` | Postgres connection string ([Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) or Neon) |

GitHub OAuth callback URL for production:

`https://<your-vercel-domain>/api/auth/callback/github`

See [T3 Vercel deployment](https://create.t3.gg/en/deployment/vercel).

## License

Private — not affiliated with career-ops or any third-party job-search tooling.
