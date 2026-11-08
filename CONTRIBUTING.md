# Contributing to Huntscope

## Setup

Requirements:

- Node.js 24
- pnpm (the pinned version is declared in `package.json`)

```bash
pnpm install --frozen-lockfile
pnpm dev
```

GitHub credentials are optional for local-folder development. Copy
`.env.example` to `.env` only when testing authentication or GitHub repository
connections.

## Before opening a pull request

Run the same checks as CI:

```bash
pnpm check
pnpm test
pnpm build
```

Add tests for behavior changes. Prefer representative career-ops Markdown
fixtures over tests that only restate constants or TypeScript-enforced shapes.

## Data compatibility changes

Parser, serializer, layout, and artifact-path changes should:

1. Preserve existing data that Huntscope does not own.
2. Cover both standard `data/` and root-level legacy layouts.
3. Cover `.career-ops-data` roots when paths are involved.
4. Preserve localized pipeline headings and CRLF line endings when writing.
5. Update `docs/DATA_COMPATIBILITY.md` when the supported contract changes.

Reusable fixtures live under `fixtures/`. Keep them free of personal or secret
data.
