# Huntscope

Analytics dashboard for your job-search data repository.

Huntscope connects to a companion data repo (for example a career-ops-style layout with `data/applications.md`, `data/pipeline.md`, and `reports/`) and turns it into charts, tables, and funnel views — without replacing the repo as the source of truth.

## Stack

- [Next.js](https://nextjs.org) 15 (App Router)
- [Better Auth](https://www.better-auth.com) — optional stateless GitHub OAuth (encrypted cookies, no database)
- [tRPC](https://trpc.io) + [Tailwind CSS](https://tailwindcss.com)
- [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) — local folder access in supported desktop browsers

## Data sources

Huntscope supports two ways to load your job-search data:

### 1. Local repository (default, no sign-in)

Open a folder from disk using the browser's directory picker. Files are read directly on your machine and never uploaded.

- Works in Chrome and Edge on desktop
- Folder access is remembered in IndexedDB between visits
- **Refresh** button re-reads files on demand
- **Disk watching** uses `FileSystemObserver` when the browser supports it
- **Installed PWA mode** keeps folder permissions longer than a regular browser tab (Chrome)

You can also install Huntscope as a desktop app. Installed PWAs get stronger local file access in Chrome, including optional `.md` file-handler launches from the OS.

### 2. GitHub repository (optional)

Sign in with GitHub only if you want cloud-hosted data.

1. **Sign in (OAuth App)** — requests only `read:user` and `user:email`
2. **Connect repository (GitHub App)** — install on **selected repositories only** with read-only contents access

Sessions and GitHub installation metadata are stored in **encrypted cookies (JWE)** — no Postgres or KV required for MVP.

## PWA support

Huntscope ships with a basic Progressive Web App setup:

- `src/app/manifest.ts` — installable app manifest with standalone display mode
- `public/sw.js` — lightweight service worker that caches the app shell
- `file_handlers` for `.md` files — open markdown files directly into Huntscope from the OS (Chromium)
- **Install app** button appears when the browser supports installation

Installing the app is recommended for local-folder workflows because Chrome persists File System Access permissions longer for installed PWAs than for regular tabs.

## GitHub setup (optional)

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

## Getting started

```bash
pnpm install
cp .env.example .env
# Fill BETTER_AUTH_SECRET (openssl rand -base64 32)
# GitHub values are only required if you want the optional cloud repo flow
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and click **Open local folder**.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm check` | Lint + typecheck |

## Releases

Huntscope uses [semantic-release](https://semantic-release.gitbook.io/) on pushes to `main`, matching the flow used in [dStruct](https://github.com/mkayander/dStruct).

- Conventional commits drive version bumps (`feat:`, `fix:`, `chore:`, etc.)
- `CHANGELOG.md`, `package.json`, and `pnpm-lock.yaml` are updated automatically
- GitHub Releases are created from the generated notes
- The package stays private, so nothing is published to npm

Local git hooks (via Husky):

- `pre-commit` — `lint-staged` + Prettier on staged files
- `pre-push` — `pnpm check`

## Deploy (Vercel)

Set these in **Project → Settings → Environment Variables** (Production, Preview, Development):

| Variable | Notes |
|----------|-------|
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | `https://<your-vercel-domain>` |
| `GITHUB_CLIENT_ID` | OAuth app client ID (optional cloud flow) |
| `GITHUB_CLIENT_SECRET` | OAuth app client secret |
| `GITHUB_APP_ID` | GitHub App ID |
| `GITHUB_APP_PRIVATE_KEY` | PEM private key; use `\n` for newlines in Vercel |
| `GITHUB_APP_SLUG` | App slug from `https://github.com/apps/<slug>` |

GitHub callbacks:

- OAuth: `https://<your-vercel-domain>/api/auth/callback/github`
- GitHub App setup: `https://<your-vercel-domain>/api/github/install/callback`

## License

Private — not affiliated with career-ops or any third-party job-search tooling.
