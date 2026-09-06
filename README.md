# Huntscope

A career-ops dashboard for visualizing repository data. Connect a GitHub repository via the GitHub App, or open a local folder in the browser to explore career-ops data without signing in.

## Features

- **GitHub App integration** — Connect specific repositories without granting broad OAuth `repo` scope
- **Local folder support** — Open a career-ops folder from disk using the File System Access API (Chrome/Edge)
- **PWA** — Install as a progressive web app for improved disk access persistence
- **Dashboard** — Visualize career-ops data with charts and metrics

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm

### Environment Variables

Copy `.env.example` to `.env` and configure as needed. GitHub integration is optional — the app works with local folders without any GitHub credentials.

| Variable                 | Required           | Description                                        |
| ------------------------ | ------------------ | -------------------------------------------------- |
| `BETTER_AUTH_SECRET`     | For sign-in        | Secret for session encryption                      |
| `BETTER_AUTH_URL`        | For sign-in        | Base URL of the app (e.g. `http://localhost:3000`) |
| `GITHUB_CLIENT_ID`       | For GitHub sign-in | OAuth App client ID                                |
| `GITHUB_CLIENT_SECRET`   | For GitHub sign-in | OAuth App client secret                            |
| `GITHUB_APP_ID`          | For repo access    | GitHub App ID                                      |
| `GITHUB_APP_PRIVATE_KEY` | For repo access    | GitHub App private key (PEM)                       |
| `GITHUB_APP_SLUG`        | For repo access    | GitHub App slug (used in install URL)              |

### Development

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Vercel Deployment

To sync environment variables to Vercel:

```bash
pnpm vercel:env
```

## GitHub Setup

1. Create a **GitHub OAuth App** for user sign-in (scopes: `read:user`, `user:email` only).
2. Create a **GitHub App** for repository access with read permissions on repository contents.
3. Set the App's callback URL to `{BETTER_AUTH_URL}/api/github/install/callback`.
4. Configure the environment variables listed above.

## Local Repository

On supported browsers (Chrome, Edge), use the folder picker on the landing page to open a local career-ops directory. Install the PWA for better persistence of folder access across sessions.

## Scripts

| Command           | Description              |
| ----------------- | ------------------------ |
| `pnpm dev`        | Start development server |
| `pnpm build`      | Production build         |
| `pnpm check`      | Lint and typecheck       |
| `pnpm vercel:env` | Sync env vars to Vercel  |
