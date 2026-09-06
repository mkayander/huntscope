# Huntscope v1.1 — Gap Analysis

**Last updated:** September 2026  
**Baseline:** Huntscope 1.0.0  
**Primary benchmark:** [career-ops-ui](https://github.com/Fighter90/career-ops-ui) v1.231.3  
**Related:** [Positioning](./PRODUCT_POSITIONING.md) · [Comparison matrix](./COMPARISON_CAREER_OPS_UI.md)

---

## Executive summary

Huntscope 1.0 delivers strong **read-only analytics** over the career-ops data contract. The largest user-perceived gaps vs career-ops-ui are:

1. **No in-app report preview** — tracker links open GitHub; local mode has no artifact viewer
2. **No write-back** — status changes require editing markdown elsewhere
3. **Minimal i18n** — date formatting only; career-ops-ui ships 17 UI locales
4. **No deeper statistics** — funnel velocity, rejection patterns, salary insights absent

v1.1 should deepen the **analytics + artifact viewing** story while preserving the read-only trust model. Write-back should be **opt-in and scoped**, not a full CRM.

---

## Current state (v1.0 inventory)

### Shipped

| Area           | Features                                                             |
| -------------- | -------------------------------------------------------------------- |
| Data ingestion | GitHub App (read), local folder (FSA API), dual-source switch        |
| Parsing        | `applications.md`, `pipeline.md`, `data/` listing, `reports/` count  |
| Overview       | Totals, avg score, active count, top-fit, score bands, status funnel |
| Analytics      | D3 scatter, radial, pace, histogram; chart → tracker filter          |
| Activity       | 12/26/52-week heatmap (Web Worker)                                   |
| Tracker        | Virtualized table, Kanban, search, sort, score/report filters        |
| Pipeline       | Pending/processed URL lists                                          |
| Links          | GitHub blob URLs for reports/PDFs                                    |
| Platform       | PWA, file handlers, Better Auth, tRPC, persisted queries             |
| Tests          | Parser, layout, score, tracker, analytics unit tests                 |

### Explicitly out of scope (v1.0)

- Scan, evaluate, apply, CV edit
- Report/PDF rendering
- Data mutation
- `cv.md`, `profile.yml`, `portals.yml` surfaces
- Multi-locale UI

---

## Gap catalog

### Tier 1 — High impact, fits positioning

#### G1. Report preview

|                |                                                                                                                                                           |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Gap**        | Tracker links to GitHub blob pages or go nowhere in local mode. career-ops-ui renders full markdown reports with parsed headers (score, legitimacy, URL). |
| **User story** | “I click a report in the tracker and read the evaluation without leaving Huntscope.”                                                                      |
| **Scope**      |                                                                                                                                                           |
|                | • Fetch report markdown (GitHub API or local file read)                                                                                                   |
|                | • Render sanitized markdown (score block, sections, links)                                                                                                |
|                | • Slide-over or dedicated panel; deep-link by report path                                                                                                 |
|                | • Parsed metadata: score, legitimacy grade, source URL                                                                                                    |
| **Effort**     | Medium — needs markdown renderer, GitHub file fetch endpoint, local file access                                                                           |
| **Risk**       | XSS via report content → must sanitize (career-ops-ui precedent)                                                                                          |
| **Priority**   | **P0**                                                                                                                                                    |

#### G2. Local artifact viewing (PDF + reports)

|                |                                                                                                |
| -------------- | ---------------------------------------------------------------------------------------------- |
| **Gap**        | Local folder mode resolves report links to `null`; PDFs unreachable in-app.                    |
| **User story** | “I opened my career-ops folder locally and can preview reports and PDFs like I can on GitHub.” |
| **Scope**      |                                                                                                |
|                | • Read files from granted directory handle (`reports/`, `output/`)                             |
|                | • PDF: embed or open in new tab via blob URL                                                   |
|                | • Report: same as G1 renderer                                                                  |
| **Effort**     | Medium — FSA permission boundaries, blob lifecycle                                             |
| **Risk**       | Permission loss on PWA reload → existing launch-handler mitigations                            |
| **Priority**   | **P0** (with G1)                                                                               |

#### G3. Internationalization (UI strings)

|                |                                                                                                                       |
| -------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Gap**        | Only date/weekday formatting is localized (`locale-context`). career-ops-ui supports 17 languages for full UI + help. |
| **User story** | “I use career-ops in Spanish; Huntscope should match.”                                                                |
| **Scope**      |                                                                                                                       |
|                | • Extract UI strings to message catalogs                                                                              |
|                | • Start with en + es + ru (career-ops core locales)                                                                   |
|                | • Locale switcher in header or settings                                                                               |
|                | • `Accept-Language` detection + persistence                                                                           |
| **Effort**     | Medium-large — touches every component                                                                                |
| **Risk**       | Scope creep to 17 locales → phase approach                                                                            |
| **Priority**   | **P1**                                                                                                                |

---

### Tier 2 — Differentiation + workflow friction

#### G4. Selective write-back (status + notes)

|                     |                                                                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Gap**             | All tracker edits happen in CLI, career-ops-ui, or raw markdown. Users bounce between tools to update status after an interview. |
| **User story**      | “I got an interview — I want to update status in Huntscope without opening VS Code.”                                             |
| **Scope (minimal)** |                                                                                                                                  |
|                     | • Inline status dropdown on tracker rows                                                                                         |
|                     | • Notes field edit (optional)                                                                                                    |
|                     | • Write to `data/applications.md` via:                                                                                           |
|                     | &nbsp;&nbsp;– Local: FSA `readwrite` permission                                                                                  |
|                     | &nbsp;&nbsp;– GitHub: Contents API commit (requires write scope upgrade)                                                         |
|                     | • Optimistic UI + conflict detection (file changed since load)                                                                   |
| **Effort**          | Large — markdown table round-trip is error-prone                                                                                 |
| **Risk**            | Breaks read-only positioning; GitHub write needs App permission change                                                           |
| **Priority**        | **P2** — ship local-only first, GitHub write behind explicit opt-in                                                              |
| **Recommendation**  | Defer GitHub write to v1.2; v1.1 local write-back only                                                                           |

#### G5. Pipeline write-back (add URL)

|                |                                                            |
| -------------- | ---------------------------------------------------------- |
| **Gap**        | Cannot add URLs to `data/pipeline.md` from Huntscope.      |
| **User story** | “I found a job on my phone — paste the URL into pipeline.” |
| **Scope**      | Append to Pending section; dedup check                     |
| **Effort**     | Medium (with G4 infrastructure)                            |
| **Priority**   | **P2** (after G4 foundation)                               |

#### G6. Statistics / funnel analytics

|                |                                                                                                                                                       |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Gap**        | career-ops-ui `#/stats` offers funnel & velocity, rejection latency, upskill suggestions, salary gaps. Huntscope has charts but not funnel semantics. |
| **User story** | “How long do applications stay in Applied before rejection?”                                                                                          |
| **Scope**      |                                                                                                                                                       |
|                | • Time-in-status estimates from date + status fields                                                                                                  |
|                | • Conversion rates between statuses                                                                                                                   |
|                | • Rejection rate by score band                                                                                                                        |
|                | • New dashboard section or expand Analytics                                                                                                           |
| **Effort**     | Medium — pure computation over parsed data                                                                                                            |
| **Risk**       | Sparse dates → graceful empty states                                                                                                                  |
| **Priority**   | **P2**                                                                                                                                                |

---

### Tier 3 — Polish and platform

#### G7. Report list browser

|              |                                                         |
| ------------ | ------------------------------------------------------- |
| **Gap**      | No `reports/` index page; only count in overview.       |
| **Scope**    | Sortable list by date/score/company; click → G1 preview |
| **Effort**   | Small-medium                                            |
| **Priority** | **P2** (natural extension of G1)                        |

#### G8. `cv.md` / profile read-only summary

|              |                                                                 |
| ------------ | --------------------------------------------------------------- |
| **Gap**      | No visibility into target roles, salary, or CV headline.        |
| **Scope**    | Read-only card: name, target roles, location from `profile.yml` |
| **Effort**   | Small — YAML parse + optional file fetch                        |
| **Priority** | **P3**                                                          |

#### G9. Data file preview

|              |                                                           |
| ------------ | --------------------------------------------------------- |
| **Gap**      | `data/` section lists filenames only.                     |
| **Scope**    | Click to preview `scan-history.tsv`, other markdown files |
| **Effort**   | Small                                                     |
| **Priority** | **P3**                                                    |

#### G10. Export / share

|              |                                                                            |
| ------------ | -------------------------------------------------------------------------- |
| **Gap**      | No PNG/PDF export of dashboard; no shareable snapshot.                     |
| **Scope**    | Export overview strip or analytics as image; read-only share link (future) |
| **Effort**   | Medium                                                                     |
| **Priority** | **P3**                                                                     |

#### G11. Keyboard shortcuts

|              |                                                                                 |
| ------------ | ------------------------------------------------------------------------------- |
| **Gap**      | career-ops-ui has `Ctrl+K` search, `Esc` modals. Huntscope has scroll-spy only. |
| **Scope**    | `/` or `Ctrl+K` → focus tracker search; `Esc` clear filters                     |
| **Effort**   | Small                                                                           |
| **Priority** | **P3**                                                                          |

#### G12. Offline / cache improvements

|              |                                                                                       |
| ------------ | ------------------------------------------------------------------------------------- |
| **Gap**      | Local mode re-parses on every visit; no offline report cache.                         |
| **Scope**    | Cache parsed data + fetched reports in IndexedDB (extend existing `idb-keyval` usage) |
| **Effort**   | Medium                                                                                |
| **Priority** | **P3**                                                                                |

---

### Out of scope for v1.x (intentional)

These are career-ops-ui responsibilities; Huntscope should not chase them:

| Feature                         | Reason                                                 |
| ------------------------------- | ------------------------------------------------------ |
| Portal scanning                 | Requires server-side adapters, SSE, career-ops scripts |
| JD evaluation / LLM calls       | Needs API keys, prompt bundling, cost tracking         |
| CV editor / PDF generation      | Document workflow, not analytics                       |
| Apply helper / Playwright       | CLI-owned surface                                      |
| Doctor / verify / dedup runners | Operational maintenance tools                          |
| In-UI `.env` editor             | Local server concern                                   |
| 17-locale help docs             | Different content problem                              |

---

## Proposed v1.1 scope

### Theme: **“See the full picture”**

Deepen read capabilities before introducing write-back.

| ID  | Feature                    | Priority | Estimate |
| --- | -------------------------- | -------- | -------- |
| G1  | Report preview (markdown)  | P0       | M        |
| G2  | Local PDF + report viewing | P0       | M        |
| G7  | Report list browser        | P2       | S        |
| G3  | i18n (en, es, ru)          | P1       | L        |
| G6  | Funnel & velocity stats    | P2       | M        |
| G11 | Keyboard shortcuts         | P3       | S        |

**Deferred to v1.2:**

| ID  | Feature                     | Notes                               |
| --- | --------------------------- | ----------------------------------- |
| G4  | Write-back (local)          | Needs markdown table writer + tests |
| G5  | Pipeline add URL            | Depends on G4                       |
| G4b | Write-back (GitHub)         | App permission + commit API         |
| G3b | i18n (remaining 14 locales) | Community contribution model        |

---

## Technical notes per feature

### G1 + G2: Report preview

```
Tracker row click
    → resolve artifact path
    → fetch content
        ├─ GitHub: tRPC getRepoFile(path) [exists partially via api]
        └─ Local: FileSystemFileHandle from stored directory handle
    → sanitize + render markdown
    → panel with metadata header (parse first H1, score line, URL)
```

**Dependencies:** markdown renderer (e.g. `react-markdown` + `remark-gfm`), sanitization lib  
**Tests:** fixture reports from career-ops, XSS cases  
**UI:** `ReportPreviewPanel` slide-over; add `dashboard-reports` section

### G3: i18n

```
src/lib/i18n/
  messages/
    en.json
    es.json
    ru.json
  use-translations.ts
  locale-context.tsx  (extend existing)
```

**Approach:** Start with dashboard strings + tracker labels; keep career-ops status names as-is (data, not UI)  
**Tests:** Snapshot key routes per locale

### G4: Write-back (v1.2 prep)

```
Status change
    → update in-memory ApplicationEntry
    → serialize row back to markdown table
    → preserve GFM pipe escapes
    → write file
        ├─ Local: createWritable() on applications.md handle
        └─ GitHub: PUT /contents with SHA (new App permission)
    → re-parse + confirm
```

**Critical:** Port `merge-tracker.mjs` / GFM escape logic or call career-ops scripts via API — do not hand-roll table formatting without tests

### G6: Funnel analytics

```typescript
// New module: src/lib/career-ops/funnel.ts
type FunnelMetrics = {
  statusTransitions: Record<string, number>;
  avgDaysInStatus: Record<string, number>;
  conversionRates: { from: string; to: string; rate: number }[];
  rejectionByScoreBand: ScoreBands;
};
```

**Input:** `ApplicationEntry[]` with parseable dates  
**UI:** New chart cards in Analytics section or sub-tab

---

## Success criteria for v1.1

| Criterion              | Measure                                                        |
| ---------------------- | -------------------------------------------------------------- |
| Report readable in-app | Click report link → rendered markdown in < 2s (GitHub + local) |
| Local parity           | Folder mode can preview reports and PDFs without GitHub        |
| i18n coverage          | ≥ 90% of user-visible strings in en/es/ru                      |
| No regressions         | Existing parser tests pass; add report renderer tests          |
| Positioning preserved  | No scan/evaluate/apply features added                          |

---

## Risk register

| Risk                                    | Likelihood | Impact | Mitigation                                 |
| --------------------------------------- | ---------- | ------ | ------------------------------------------ |
| Markdown table write-back corrupts data | Medium     | High   | Defer to v1.2; extensive round-trip tests  |
| Report XSS                              | Low        | High   | Sanitize all rendered HTML                 |
| i18n scope creep                        | High       | Medium | Ship 3 locales; crowdsource rest           |
| GitHub rate limits on report fetch      | Medium     | Low    | Cache report content in query layer        |
| Feature creep toward career-ops-ui      | Medium     | High   | Maintain out-of-scope list; review each PR |

---

## Suggested milestone breakdown

### v1.1.0 — Artifacts

- G1 Report preview (GitHub)
- G2 Local report + PDF preview
- G7 Report list browser

### v1.1.1 — Locale

- G3 i18n en/es/ru
- Locale switcher

### v1.1.2 — Deeper analytics

- G6 Funnel & velocity
- G11 Keyboard shortcuts

### v1.2.0 — Write (optional)

- G4 Local write-back (status)
- G5 Pipeline add URL
- G4b GitHub write-back (opt-in, permission upgrade)

---

## Open questions

1. **GitHub write-back:** Is upgrading the GitHub App to Contents write permission acceptable to users who chose Huntscope for read-only safety?
2. **Report renderer:** Client-side only, or server-render for GitHub mode SEO/share?
3. **i18n contribution:** Crowdsource remaining 14 locales via Weblate/Crowdin, or stay minimal?
4. **career-ops upstream:** Should Huntscope propose a shared `@career-ops/parsers` package to avoid parser drift?

---

## Related documents

- [Product positioning](./PRODUCT_POSITIONING.md)
- [Feature comparison vs career-ops-ui](./COMPARISON_CAREER_OPS_UI.md)
