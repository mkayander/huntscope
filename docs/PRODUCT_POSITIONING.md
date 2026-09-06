# Huntscope — Product Positioning

**Version:** 1.0.0  
**Last updated:** September 2026  
**Audience:** career-ops users, contributors, and potential adopters evaluating Huntscope vs alternatives.

---

## One-liner

**Huntscope is a hosted, read-only analytics dashboard for career-ops job-search data — visualize your hunt from GitHub or a local folder without running a local server.**

---

## Category

Huntscope is **not** a job search platform. It sits in a narrow category:

| Layer            | Product type               | Examples                                                    |
| ---------------- | -------------------------- | ----------------------------------------------------------- |
| Workflow engine  | AI job-search CLI          | [career-ops](https://github.com/santifer/career-ops)        |
| Operational UI   | Local CRM / command center | [career-ops-ui](https://github.com/Fighter90/career-ops-ui) |
| **Analytics UI** | **Read-only dashboard**    | **Huntscope**                                               |
| SaaS trackers    | Full-stack job search apps | Teal, Huntr, Simplify                                       |

Think of Huntscope as **“Grafana for your job-search repo”** — insight and visualization over a local-first data contract, not a replacement for the pipeline that produces the data.

---

## Problem

career-ops users accumulate rich structured data (`data/applications.md`, `data/pipeline.md`, `reports/`) but lack a polished way to **see** it:

- Markdown tables are hard to scan at scale
- The career-ops terminal dashboard is functional but limited
- career-ops-ui is powerful but requires a local Node server and full career-ops install
- SaaS trackers (Teal, Huntr) don’t speak the career-ops file format and lock data in the cloud

**Pain:** “I have 40 evaluated applications in my private repo — I want charts, filters, and a command-center view without spinning up another local app.”

---

## Solution

Huntscope connects to career-ops data in two ways:

1. **GitHub App** — read a companion repository with scoped, read-only access (no broad `repo` OAuth)
2. **Local folder** — open a career-ops directory via the File System Access API (Chrome/Edge), no sign-in required

It parses the same markdown contract as career-ops and renders:

- Overview metrics (total apps, avg score, active pipeline, top-fit count)
- D3 analytics (status radial, score scatter, application pace, histogram)
- GitHub-style activity heatmap
- Virtualized tracker (table + Kanban) with search, sort, and status filters
- Pipeline inbox (pending/processed URLs)
- Deep links to reports and PDFs on GitHub

Everything is **read-only**. Huntscope never mutates tracker, pipeline, or report files.

---

## Target users

### Primary

- **career-ops power users** who already run evaluations via CLI and want a better dashboard
- **Developers** who keep job-search data in a private GitHub repo and want remote viewing
- **Privacy-conscious job seekers** who want analytics without uploading CV data to a SaaS

### Secondary

- **Teams or coaches** reviewing a shared companion repo (read-only GitHub access)
- **PWA users** who open local folders from disk with installable app persistence

### Non-target

- Users who need scan, evaluate, apply, or CV editing (use career-ops + career-ops-ui)
- Users without a career-ops-compatible data layout
- Users who want a full job search CRM with autofill and job discovery (use Teal/Huntr/Simplify)

---

## Value proposition

| For…                  | Huntscope delivers…                             |
| --------------------- | ----------------------------------------------- |
| career-ops users      | Beautiful charts over data you already have     |
| GitHub-native devs    | Companion-repo viewing with minimal OAuth scope |
| Local-first advocates | Folder picker + PWA, no account required        |
| Privacy               | Read-only; no telemetry on application content  |

### Key differentiators

1. **Hosted** — no `localhost:4317`, no Express server to maintain
2. **Read-only by design** — safe to connect to production career-ops data
3. **Dual ingestion** — cloud (GitHub) and local (browser FS) share one parser
4. **Analytics-first** — D3 charts, heatmap, interactive filtering beyond what markdown provides
5. **Modern UX** — dark glass UI, scroll-spy nav, Web Worker parsing, PWA install

---

## Competitive positioning

```
                    Full workflow (scan → apply → track)
                              ▲
            career-ops-ui     │     Teal / Huntr / Simplify
                              │
    Local / git-first ◄───────┼───────► Cloud SaaS
                              │
            career-ops CLI    │
                              │
                         Huntscope ★
                              │
                    Read-only analytics
                              ▼
```

### vs career-ops-ui

|             | career-ops-ui                          | Huntscope                           |
| ----------- | -------------------------------------- | ----------------------------------- |
| Role        | Operational command center             | Analytics mirror                    |
| Hosting     | Local (`127.0.0.1:4317`)               | Cloud (Vercel)                      |
| Writes data | Yes                                    | No                                  |
| Setup       | Requires career-ops + `web-ui/` layout | Standalone URL or folder picker     |
| Best for    | Running the full pipeline from browser | Viewing and analyzing existing data |

**Positioning statement:** _“Use career-ops-ui to work; use Huntscope to see.”_

### vs SaaS trackers (Teal, Huntr, Jobscan, Simplify)

SaaS products own the entire workflow and store data in their platform. Huntscope is format-native to career-ops markdown and never becomes the system of record.

**Positioning statement:** _“Your repo stays the source of truth; Huntscope is the lens.”_

---

## Positioning pillars

### 1. Precision over volume

Huntscope doesn’t auto-apply or blast portals. It visualizes the disciplined, evidence-based search that career-ops encourages — scores, status funnels, fit bands.

### 2. Local-first, cloud-optional

Local folder mode works without sign-in. GitHub mode is optional for users who sync companion repos. No vendor lock-in.

### 3. Developer-grade trust

- GitHub App with repository-scoped read access
- No writes to user data
- Open parser logic with Vitest coverage
- PWA file handlers for `.md` launch

### 4. Analytics that markdown can’t

Interactive D3 charts, heatmaps, cross-filtering between charts and tracker — insight layers that neither `applications.md` nor a terminal TUI provides.

---

## Messaging framework

### Headline options

- “See your job hunt clearly.”
- “Analytics for your career-ops repo.”
- “Command-center insights. Read-only. Yours.”

### Elevator pitch (30 seconds)

> Huntscope is a dashboard for career-ops — the open-source AI job search workflow that stores everything in markdown. Connect your GitHub companion repo or open a local folder, and get charts, heatmaps, and a filterable tracker without running a local server. It’s read-only, so your data stays yours.

### Proof points

- Parses `data/applications.md` and `data/pipeline.md` natively
- GitHub App integration (not broad OAuth `repo` scope)
- Works offline-ish via PWA + local folder
- D3 analytics with chart-to-tracker filtering
- Built on Next.js 16, tRPC, Better Auth

---

## Go-to-market angles

| Channel                    | Message                                                   |
| -------------------------- | --------------------------------------------------------- |
| career-ops community       | “Official-feeling analytics layer for your existing repo” |
| GitHub / dev Twitter       | “Grafana for your job search markdown”                    |
| Privacy forums             | “Job hunt analytics without uploading your CV to a SaaS”  |
| Vercel / Next.js ecosystem | “Showcase app: GitHub App + PWA + tRPC”                   |

---

## What we are not claiming

- Not a career-ops replacement or fork
- Not an auto-apply or job discovery tool
- Not a resume builder or ATS optimizer
- Not a collaborative ATS for recruiters

---

## Success metrics (suggested)

| Metric                                      | Why it matters        |
| ------------------------------------------- | --------------------- |
| Weekly active data sources (GitHub + local) | Core usage signal     |
| Dashboard sections viewed per session       | Analytics value       |
| GitHub App install → repo connect rate      | Integration friction  |
| PWA installs                                | Local-mode stickiness |
| Return visits within 7 days                 | Habit formation       |

---

## Strategic risks

| Risk                             | Mitigation                                           |
| -------------------------------- | ---------------------------------------------------- |
| career-ops-ui adds hosted mode   | Differentiate on read-only safety + analytics depth  |
| career-ops format changes        | Tight parser tests; follow upstream data contract    |
| Low awareness outside career-ops | Docs, README cross-links, community posts            |
| “Read-only” seen as limitation   | Position as trust feature; v1.1 selective write-back |

---

## Related documents

- [Feature comparison vs career-ops-ui](./COMPARISON_CAREER_OPS_UI.md)
- [Gap analysis for v1.1](./GAP_ANALYSIS_V1.1.md)
