# Huntscope vs career-ops-ui — Feature Comparison Matrix

**Last updated:** September 2026  
**Huntscope version:** 1.0.0  
**career-ops-ui reference:** v1.231.3 ([Fighter90/career-ops-ui](https://github.com/Fighter90/career-ops-ui))

### Legend

| Symbol | Meaning             |
| ------ | ------------------- |
| ✅     | Full support        |
| ◐      | Partial / limited   |
| ❌     | Not supported       |
| ☁️     | Cloud / hosted only |
| 🖥️     | Local only          |
| 🔒     | Read-only           |

---

## Summary

| Dimension                       | Huntscope                         | career-ops-ui                          |
| ------------------------------- | --------------------------------- | -------------------------------------- |
| **Primary role**                | Analytics dashboard               | Full command center                    |
| **Deployment**                  | ☁️ Hosted (Vercel)                | 🖥️ Local Express server                |
| **Requires career-ops install** | No (needs compatible data layout) | Yes (runs as `career-ops/web-ui/`)     |
| **Mutates user data**           | 🔒 No                             | ✅ Yes                                 |
| **Sign-in required**            | Optional (GitHub for cloud mode)  | No (local server)                      |
| **Best for**                    | Viewing & analyzing existing data | Running the full pipeline from browser |

---

## 1. Deployment & access

| Feature                              | Huntscope               | career-ops-ui   |
| ------------------------------------ | ----------------------- | --------------- |
| Standalone URL (no local server)     | ✅ ☁️                   | ❌              |
| Local server (`localhost`)           | ❌                      | ✅ 🖥️ `:4317`   |
| Works without career-ops repo cloned | ✅ (folder or GitHub)   | ❌              |
| PWA installable                      | ✅                      | ◐ (browser tab) |
| LAN exposure (`HOST=0.0.0.0`)        | N/A (cloud)             | ✅              |
| One-curl setup                       | ❌                      | ✅ `setup.sh`   |
| Custom data root (`CAREER_OPS_ROOT`) | ◐ (local folder picker) | ✅ env var      |

---

## 2. Data sources

| Feature                               | Huntscope                  | career-ops-ui                     |
| ------------------------------------- | -------------------------- | --------------------------------- |
| Read `data/applications.md`           | ✅                         | ✅                                |
| Read `data/pipeline.md`               | ✅                         | ✅                                |
| Read `reports/`                       | ✅ (count + links)         | ✅ (full browser)                 |
| Read `cv.md`                          | ❌                         | ✅ (editor)                       |
| Read `config/profile.yml`             | ❌                         | ✅                                |
| Read `portals.yml`                    | ❌                         | ✅                                |
| GitHub companion repo                 | ✅ (GitHub App, read-only) | ❌                                |
| Local folder (File System Access API) | ✅                         | ◐ (reads parent `../` via server) |
| PWA file handler (open `.md`)         | ✅                         | ❌                                |
| Dual source switch (local ↔ GitHub)   | ✅                         | ❌                                |

---

## 3. Dashboard & analytics

| Feature                             | Huntscope | career-ops-ui                                |
| ----------------------------------- | --------- | -------------------------------------------- |
| Application count                   | ✅        | ✅                                           |
| Average score                       | ✅        | ✅                                           |
| Status breakdown                    | ✅        | ✅                                           |
| Pipeline pending/processed counts   | ✅        | ✅                                           |
| Reports count                       | ✅        | ✅                                           |
| Recent applications (top 5)         | ✅        | ✅                                           |
| Latest report preview               | ❌        | ✅                                           |
| **D3 score scatter chart**          | ✅        | ❌                                           |
| **D3 status radial chart**          | ✅        | ❌                                           |
| **D3 application pace timeline**    | ✅        | ❌                                           |
| **D3 score histogram**              | ✅        | ❌                                           |
| **Activity heatmap (GitHub-style)** | ✅        | ❌                                           |
| Chart → tracker cross-filter        | ✅        | ❌                                           |
| Multi-tab statistics (`#/stats`)    | ❌        | ✅ (funnel, velocity, upskill, salary, etc.) |
| Funded-company discovery            | ❌        | ✅                                           |
| Usage / token cost HUD              | ❌        | ✅                                           |

---

## 4. Tracker

| Feature                                        | Huntscope             | career-ops-ui     |
| ---------------------------------------------- | --------------------- | ----------------- |
| Table view                                     | ✅ (virtualized)      | ✅                |
| Kanban / board view                            | ✅                    | ◐                 |
| Search (company, role, notes)                  | ✅                    | ✅                |
| Sort (num, date, company, role, score, status) | ✅                    | ✅                |
| Status filter                                  | ✅                    | ✅                |
| Score band filter                              | ✅                    | ✅                |
| Report presence filter                         | ✅                    | ❌                |
| Edit tracker rows                              | 🔒 ❌                 | ✅                |
| `normalize-statuses.mjs` one-click             | ❌                    | ✅                |
| `dedup-tracker.mjs` one-click                  | ❌                    | ✅                |
| `merge-tracker.mjs` one-click                  | ❌                    | ✅                |
| GFM pipe-escape round-trip                     | ◐ (read)              | ✅ (read + write) |
| Artifact links (PDF, report)                   | ✅ (GitHub blob URLs) | ✅ (local paths)  |

---

## 5. Pipeline

| Feature                                 | Huntscope | career-ops-ui |
| --------------------------------------- | --------- | ------------- |
| View pending URLs                       | ✅        | ✅            |
| View processed URLs                     | ✅        | ✅            |
| Add / remove pipeline URLs              | 🔒 ❌     | ✅            |
| URL preview proxy (SSRF-safe)           | ❌        | ✅            |
| Jump URL → evaluate                     | ❌        | ✅            |
| Paste URL into global search → pipeline | ❌        | ✅            |

---

## 6. Reports & artifacts

| Feature                                       | Huntscope | career-ops-ui           |
| --------------------------------------------- | --------- | ----------------------- |
| Report count                                  | ✅        | ✅                      |
| Report list browser                           | ❌        | ✅                      |
| In-app report preview (markdown render)       | ❌        | ✅                      |
| Parsed report header (score, legitimacy, URL) | ❌        | ✅                      |
| PDF output browser                            | ❌        | ✅ (`/api/output/pdfs`) |
| Link to report on GitHub                      | ✅        | N/A                     |

---

## 7. Job discovery & evaluation

| Feature                                      | Huntscope | career-ops-ui           |
| -------------------------------------------- | --------- | ----------------------- |
| Portal scan (Greenhouse, Ashby, Lever, etc.) | ❌        | ✅ (12+ adapters)       |
| Regional portals (hh.ru, Habr, etc.)         | ❌        | ✅                      |
| RSS / Telegram channel sources               | ❌        | ✅                      |
| Live SSE scan logs                           | ❌        | ✅                      |
| Paste JD → evaluate                          | ❌        | ✅ (Anthropic / Gemini) |
| Auto-pipeline (`#/auto`)                     | ❌        | ✅                      |
| Deep company research                        | ❌        | ✅                      |
| Interview prep modes                         | ❌        | ✅                      |
| Apply helper / checklist                     | ❌        | ✅                      |
| Batch evaluate                               | ❌        | ✅                      |
| Copy-paste prompt fallback (no API key)      | ❌        | ✅                      |

---

## 8. CV & documents

| Feature                                | Huntscope | career-ops-ui |
| -------------------------------------- | --------- | ------------- |
| CV markdown editor                     | ❌        | ✅            |
| CV side-by-side preview                | ❌        | ✅            |
| CV upload                              | ❌        | ✅            |
| CV Studio (tailor, humanize, PII mask) | ❌        | ✅            |
| Cover letter generator                 | ❌        | ✅            |
| Generate PDF                           | ❌        | ✅            |
| Two-pager config                       | ❌        | ✅            |
| Mock interview                         | ❌        | ✅            |

---

## 9. Maintenance & operations

| Feature                    | Huntscope | career-ops-ui |
| -------------------------- | --------- | ------------- |
| `doctor.mjs` health check  | ❌        | ✅            |
| `verify-pipeline.mjs`      | ❌        | ✅            |
| Activity / audit log       | ❌        | ✅            |
| In-UI `.env` editor        | ❌        | ✅            |
| Notifications drawer       | ❌        | ✅            |
| Global search (`Ctrl+K`)   | ❌        | ✅            |
| Help / user guide (in-app) | ❌        | ✅            |

---

## 10. Auth, privacy & security

| Feature                          | Huntscope            | career-ops-ui     |
| -------------------------------- | -------------------- | ----------------- |
| No account required              | ✅ (local mode)      | ✅                |
| GitHub OAuth sign-in             | ✅ (optional)        | ❌                |
| GitHub App (scoped repo read)    | ✅                   | ❌                |
| Read-only data access            | ✅ 🔒                | ❌ (writes)       |
| Data leaves user's machine       | ◐ (GitHub API fetch) | ❌ (local server) |
| SSRF protections (URL preview)   | N/A                  | ✅                |
| XSS sanitization on CV save      | N/A                  | ✅                |
| Telemetry on application content | ❌                   | ❌                |

---

## 11. UX & polish

| Feature                          | Huntscope    | career-ops-ui        |
| -------------------------------- | ------------ | -------------------- |
| Dark mode UI                     | ✅ (default) | ✅                   |
| Scroll-spy section nav           | ✅           | ◐                    |
| Three.js landing background      | ✅           | ❌                   |
| Glass / glow panel design system | ✅           | ◐ (docs-style)       |
| Mobile-responsive tracker        | ✅           | ✅ (actively tested) |
| Skeleton loading states          | ✅           | ✅                   |
| Web Worker parsing               | ✅           | ❌                   |
| TanStack Query persistence       | ✅           | ❌                   |
| Keyboard shortcuts               | ◐            | ✅ (`Ctrl+K`, `Esc`) |

---

## 12. Internationalization

| Feature             | Huntscope                | career-ops-ui     |
| ------------------- | ------------------------ | ----------------- |
| UI locales          | ◐ (date formatting only) | ✅ (17 languages) |
| Localized help docs | ❌                       | ✅                |
| Localized README    | ❌ (EN)                  | ✅ (17 languages) |

---

## 13. Engineering

| Feature          | Huntscope                               | career-ops-ui                   |
| ---------------- | --------------------------------------- | ------------------------------- |
| Stack            | Next.js 16, React 19, tRPC, Better Auth | Express, vanilla SPA            |
| Test suite size  | ◐ (Vitest, parser-focused)              | ✅ (3000+ unit, 101 Playwright) |
| Build step       | ✅ (`next build`)                       | ❌ (static `public/`)           |
| Semantic release | ✅                                      | ✅                              |
| TypeScript       | ✅ (strict)                             | ◐ (JS + types in tests)         |

---

## Decision guide

### Choose Huntscope when you…

- Already have career-ops data and only need **visualization**
- Want a **hosted** dashboard without running a local server
- Need **GitHub companion-repo** viewing with read-only safety
- Care about **D3 analytics**, heatmaps, and chart-driven filtering
- Want **local folder** access via PWA without sign-in

### Choose career-ops-ui when you…

- Need to **run the full pipeline** (scan, evaluate, apply) from the browser
- Want to **edit** tracker, pipeline, CV, and config files in-app
- Need **portal scanning** with live SSE logs
- Require **report preview**, CV studio, interview prep, or statistics tabs
- Prefer everything **on localhost** with no cloud dependency

### Use both when you…

- Run career-ops-ui locally for daily operations
- Use Huntscope for sharing a read-only view (GitHub) or quick analytics on the go

---

## Feature parity roadmap (Huntscope perspective)

High-value gaps to close without becoming career-ops-ui:

| Priority | Feature                                | Rationale                         |
| -------- | -------------------------------------- | --------------------------------- |
| P0       | Report preview (markdown render)       | Most requested read feature       |
| P1       | i18n (UI strings)                      | career-ops-ui supports 17 locales |
| P1       | Local report/PDF preview (folder mode) | Complete artifact story           |
| P2       | Selective write-back (status, notes)   | Reduce round-trips to CLI         |
| P3       | Statistics tab (funnel, velocity)      | Deeper analytics parity           |

See [Gap analysis for v1.1](./GAP_ANALYSIS_V1.1.md) for detailed planning.
