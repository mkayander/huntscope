# Huntscope vs Job Tracking Products on the Market

**Last updated:** September 2026  
**Huntscope version:** 1.0.0

Comparison of Huntscope against general-purpose job application trackers, resume platforms, and DIY alternatives. For the career-ops ecosystem comparison, see [Comparison vs career-ops-ui](./COMPARISON_CAREER_OPS_UI.md).

### Legend

| Symbol | Meaning                             |
| ------ | ----------------------------------- |
| ✅     | Full support                        |
| ◐      | Partial / limited                   |
| ❌     | Not supported                       |
| 🔒     | Read-only                           |
| 💰     | Paid tier required for full feature |

---

## Market landscape

Job tracking products fall into five overlapping segments:

| Segment                     | What it optimizes for                      | Examples                     |
| --------------------------- | ------------------------------------------ | ---------------------------- |
| **CRM trackers**            | Organization, notes, pipeline visibility   | Huntr, Teal (tracker layer)  |
| **Resume + ATS platforms**  | Keyword matching, tailoring, then tracking | Jobscan, Teal (resume layer) |
| **Autofill extensions**     | Speed of form completion                   | Simplify, Teal autofill      |
| **Auto-apply agents**       | Volume with minimal user effort            | Sonara, LazyApply, LoopCV    |
| **Format-native analytics** | Visualization over existing data           | **Huntscope**                |

Huntscope is **not in the CRM segment**. It does not replace Teal or Huntr for users who want to capture jobs from LinkedIn and manage contacts in a SaaS. It serves users who already store job-search data in a **career-ops-compatible repo** and want analytics without migrating to a third-party database.

---

## Product profiles (at a glance)

| Product                   | Tagline                            | Free tier                   | Paid (approx.)                 | Data lives in…               |
| ------------------------- | ---------------------------------- | --------------------------- | ------------------------------ | ---------------------------- |
| **Huntscope**             | Analytics for career-ops repos     | ✅ (local + limited GitHub) | Free (self-host) / deploy cost | Your markdown repo or folder |
| **Teal**                  | Job search CRM + AI resume builder | ✅ unlimited tracking       | $9–29/mo (Teal+)               | Teal cloud                   |
| **Huntr**                 | Visual kanban + contact CRM        | ✅ (100 jobs)               | ~$30–40/mo (Pro)               | Huntr cloud                  |
| **Simplify**              | Autofill + tracker                 | ✅ unlimited autofill       | ~$40/mo (Simplify+)            | Simplify cloud               |
| **Jobscan**               | ATS resume optimization + tracker  | ◐ (5 scans/mo)              | ~$30–50/mo (Premium)           | Jobscan cloud                |
| **Google Sheets / Excel** | DIY spreadsheet                    | ✅                          | Free                           | Your file                    |
| **Notion**                | Flexible workspace + templates     | ✅                          | Free–$10/mo                    | Notion cloud                 |

---

## Executive summary

| Dimension                      | Huntscope                            | Typical SaaS tracker (Teal/Huntr/Simplify) |
| ------------------------------ | ------------------------------------ | ------------------------------------------ |
| **Job**                        | Visualize existing career-ops data   | Capture, apply, and track from scratch     |
| **Data ownership**             | You own markdown in git              | Vendor owns application records            |
| **Sign-up required**           | Optional                             | Yes                                        |
| **Job board capture**          | ❌                                   | ✅ Chrome extension                        |
| **Resume / ATS tools**         | ❌                                   | ✅ Core value                              |
| **Autofill / auto-apply**      | ❌                                   | ✅ (varies by product)                     |
| **Structured fit scoring**     | ✅ (career-ops 1.0–5.0 rubric)       | ◐ (keyword match % or basic AI)            |
| **D3 analytics + heatmap**     | ✅                                   | ◐ (basic charts or none)                   |
| **Works offline (local data)** | ✅ (PWA + folder)                    | ❌                                         |
| **Privacy**                    | Read-only; no CV upload to Huntscope | CV and JDs stored on vendor servers        |

**Bottom line:** Huntscope competes with the **tracker view** of SaaS products, not the **workflow**. Choose SaaS if you need discovery, autofill, and resume tooling. Choose Huntscope if you already run career-ops and want a better dashboard over data you control.

---

## 1. Job capture & discovery

| Feature                            | Huntscope | Teal            | Huntr | Simplify | Jobscan |
| ---------------------------------- | --------- | --------------- | ----- | -------- | ------- |
| Chrome extension to save jobs      | ❌        | ✅ (40+ boards) | ✅    | ✅       | ✅      |
| Auto-populate JD, salary, URL      | ❌        | ✅              | ✅    | ✅       | ✅      |
| Job matching feed                  | ❌        | ◐               | ❌    | ✅       | ✅      |
| Portal scanning (Greenhouse, etc.) | ❌        | ❌              | ❌    | ❌       | ❌      |
| Paste URL → structured entry       | ❌        | ✅              | ✅    | ✅       | ✅      |
| Import from spreadsheet            | ❌        | ◐               | ◐     | ❌       | ❌      |

**Note:** Portal scanning belongs to career-ops / career-ops-ui, not general trackers.

---

## 2. Application tracking

| Feature                     | Huntscope        | Teal | Huntr         | Simplify | Jobscan | Sheets     | Notion       |
| --------------------------- | ---------------- | ---- | ------------- | -------- | ------- | ---------- | ------------ |
| Unlimited tracked jobs      | ✅               | ✅   | 💰 (100 free) | ✅       | ✅ 💰   | ✅         | ✅           |
| Kanban / pipeline board     | ✅               | ✅   | ✅            | ✅       | ✅      | ◐ (manual) | ◐ (template) |
| Table view with sort/filter | ✅ (virtualized) | ✅   | ✅            | ✅       | ✅      | ✅         | ◐            |
| Status funnel / stages      | ✅               | ✅   | ✅            | ✅       | ✅      | ◐          | ◐            |
| Search across applications  | ✅               | ✅   | ✅            | ✅       | ✅      | ◐          | ◐            |
| Notes per application       | 🔒 read          | ✅   | ✅            | ✅       | ✅      | ✅         | ✅           |
| Edit status in-app          | 🔒 ❌            | ✅   | ✅            | ✅       | ✅      | ✅         | ✅           |
| Interview dates & reminders | ❌               | ✅   | ✅            | ◐        | ✅      | ◐          | ◐            |
| Contact / recruiter CRM     | ❌               | ◐    | ✅            | ◐        | ◐       | ◐          | ◐            |
| Calendar sync               | ❌               | ◐    | ✅            | ❌       | ✅      | ❌         | ◐            |
| Follow-up reminders         | ❌               | ✅   | ✅            | ◐        | ◐       | ❌         | ◐            |
| Map view of companies       | ❌               | ❌   | ✅            | ❌       | ❌      | ❌         | ❌           |

---

## 3. Resume & application documents

| Feature                    | Huntscope     | Teal  | Huntr | Simplify | Jobscan   |
| -------------------------- | ------------- | ----- | ----- | -------- | --------- |
| Resume builder             | ❌            | ✅    | ✅    | ✅       | ✅        |
| AI resume tailoring per JD | ❌            | ✅ 💰 | ✅ 💰 | ✅ 💰    | ✅ 💰     |
| ATS keyword match score    | ❌            | ✅ 💰 | ◐     | ◐        | ✅ (core) |
| Cover letter generator     | ❌            | ✅ 💰 | ✅ 💰 | ✅ 💰    | ✅ 💰     |
| Version per application    | 🔒 links only | ✅    | ✅    | ✅       | ✅        |
| PDF generation             | ❌            | ✅    | ✅    | ✅       | ✅        |
| LinkedIn optimizer         | ❌            | ◐     | ❌    | ◐        | ✅ 💰     |

Huntscope links to PDFs in `output/` but does not create or edit them.

---

## 4. Application automation

| Feature                       | Huntscope | Teal  | Huntr     | Simplify  | Jobscan | Sonara / LazyApply |
| ----------------------------- | --------- | ----- | --------- | --------- | ------- | ------------------ |
| Form autofill (browser)       | ❌        | ◐ 💰  | ✅ (free) | ✅ (free) | ❌      | ◐                  |
| One-click apply               | ❌        | ❌    | ❌        | ❌        | ◐       | ✅                 |
| Fully automated apply         | ❌        | ❌    | ❌        | ❌        | ◐       | ✅                 |
| AI answers to essay questions | ❌        | ✅ 💰 | ◐         | ✅ 💰     | ✅ 💰   | ✅                 |

Huntscope assumes applications are evaluated and tracked via career-ops CLI, not submitted through the dashboard.

---

## 5. Analytics & insights

| Feature                               | Huntscope    | Teal | Huntr | Simplify | Jobscan     | Sheets      |
| ------------------------------------- | ------------ | ---- | ----- | -------- | ----------- | ----------- |
| Application count / overview          | ✅           | ✅   | ✅    | ✅       | ✅          | ◐           |
| Average fit score (structured rubric) | ✅ (1.0–5.0) | ❌   | ◐     | ◐        | ◐ (match %) | ◐           |
| Score bands (high / med / low)        | ✅           | ❌   | ◐     | ❌       | ◐           | ◐           |
| D3 interactive charts                 | ✅           | ◐    | ❌    | ❌       | ❌          | ✅ (manual) |
| Activity heatmap                      | ✅           | ❌   | ❌    | ❌       | ❌          | ◐           |
| Chart → tracker cross-filter          | ✅           | ❌   | ❌    | ❌       | ❌          | ❌          |
| Funnel / conversion analytics         | ❌ (v1.1)    | ◐    | ◐     | ❌       | ◐           | ✅ (manual) |
| Rejection pattern analysis            | ❌           | ◐    | ◐     | ❌       | ◐           | ◐           |
| Pipeline inbox (pending URLs)         | ✅           | ◐    | ◐     | ◐        | ❌          | ◐           |

**Huntscope advantage:** Deepest **read-only analytics** for users with career-ops scoring data. SaaS trackers optimize for capture and apply, not multi-dimensional fit visualization.

---

## 6. Evaluation & scoring methodology

| Aspect                       | Huntscope                                                        | SaaS trackers                                |
| ---------------------------- | ---------------------------------------------------------------- | -------------------------------------------- |
| **Score source**             | career-ops A–F rubric → 1.0–5.0                                  | Keyword density, basic AI match %, or manual |
| **Legitimacy check**         | In report files (read-only link)                                 | Rare                                         |
| **Reproducible methodology** | [career-ops.org/methodology](https://career-ops.org/methodology) | Opaque / vendor-specific                     |
| **Batch evaluation**         | Via career-ops CLI                                               | Not applicable                               |
| **Score history in tracker** | ✅ per row                                                       | ◐ match % on card                            |

Users who care about **evidence-based fit scores** (not just keyword overlap) align with Huntscope + career-ops. Users who care about **ATS keyword percentage** align with Jobscan or Teal+.

---

## 7. Data model & ownership

| Aspect                    | Huntscope                     | Teal / Huntr / Simplify | Jobscan         | Sheets / Notion       |
| ------------------------- | ----------------------------- | ----------------------- | --------------- | --------------------- |
| **System of record**      | Your git repo / folder        | Vendor database         | Vendor database | Your file / workspace |
| **Export**                | Already plain text (markdown) | CSV / PDF export        | Limited         | Native                |
| **Portability**           | ✅ git clone                  | ◐ export on leave       | ◐               | ✅                    |
| **Private repo friendly** | ✅                            | N/A (cloud)             | N/A             | ◐                     |
| **Works without vendor**  | ✅ (local mode)               | ❌                      | ❌              | ✅                    |
| **Sync across devices**   | GitHub or manual              | ✅ automatic            | ✅ automatic    | Cloud sync            |
| **Collaboration**         | GitHub repo access            | ◐                       | ◐               | ✅                    |

**Huntscope positioning:** For developers who treat job search like a repo — versioned, private, auditable — not a SaaS silo.

---

## 8. Privacy & trust

| Aspect                           | Huntscope                  | SaaS trackers                 |
| -------------------------------- | -------------------------- | ----------------------------- |
| CV stored on vendor servers      | ❌ (not read by Huntscope) | ✅ required for most features |
| Read-only access option          | ✅ 🔒                      | ❌                            |
| GitHub scoped permissions        | ✅ (App, repo pick)        | N/A                           |
| Telemetry on application content | ❌                         | Varies                        |
| Open-source data format          | ✅ (career-ops markdown)   | ❌                            |
| Account required                 | Optional                   | Required                      |

---

## 9. Platform & access

| Feature            | Huntscope         | Teal | Huntr | Simplify | Jobscan |
| ------------------ | ----------------- | ---- | ----- | -------- | ------- |
| Web app            | ✅                | ✅   | ✅    | ✅       | ✅      |
| Mobile app         | ◐ (PWA)           | ◐    | ✅    | ◐        | ❌      |
| Chrome extension   | ❌                | ✅   | ✅    | ✅       | ✅      |
| Offline use        | ✅ (local folder) | ❌   | ◐     | ❌       | ❌      |
| Self-hostable      | ✅ (open source)  | ❌   | ❌    | ❌       | ❌      |
| API / integrations | ◐ (tRPC)          | ◐    | ◐     | ❌       | ❌      |

---

## 10. Internationalization

| Product       | UI languages                         |
| ------------- | ------------------------------------ |
| Huntscope     | ◐ (date formatting; full UI en only) |
| Teal          | Primarily English                    |
| Huntr         | Primarily English                    |
| Simplify      | Primarily English                    |
| Jobscan       | Primarily English                    |
| career-ops-ui | 17 locales (different product)       |

i18n is not a SaaS differentiator today; Huntscope gap vs career-ops-ui matters more than vs Teal/Huntr.

---

## Pricing comparison (2026)

| Product             | Free                                        | Paid tiers                      | Best value for                           |
| ------------------- | ------------------------------------------- | ------------------------------- | ---------------------------------------- |
| **Huntscope**       | Full analytics (local); GitHub needs deploy | Hosting only (~$0 Vercel hobby) | career-ops users wanting free dashboards |
| **Teal**            | Unlimited tracking, limited AI              | $9/wk · $29/mo · $79/qtr        | Resume tailoring + organized CRM         |
| **Huntr**           | 100 jobs, autofill                          | ~$30–40/mo Pro                  | Visual kanban + contact CRM              |
| **Simplify**        | Unlimited autofill + tracker                | ~$40/mo Simplify+               | High-volume manual apply                 |
| **Jobscan**         | 5 scans/mo                                  | ~$50/mo · ~$90/qtr              | Enterprise ATS keyword optimization      |
| **Sheets / Notion** | Generous free tiers                         | Notion Plus ~$10/mo             | Zero vendor lock-in, full DIY control    |

**Cost note:** Huntscope has no subscription, but requires an existing career-ops workflow. Total cost of ownership = career-ops (free) + optional LLM API costs + Huntscope hosting. SaaS trackers bundle LLM/resume features into subscription.

---

## Segment comparison matrix

| Capability                  | Huntscope | Teal | Huntr | Simplify | Jobscan | DIY (Sheets) |
| --------------------------- | --------- | ---- | ----- | -------- | ------- | ------------ |
| **Track applications**      | ◐ read    | ✅   | ✅    | ✅       | ✅      | ✅           |
| **Capture from job boards** | ❌        | ✅   | ✅    | ✅       | ✅      | ❌           |
| **Resume / ATS**            | ❌        | ✅   | ◐     | ◐        | ✅      | ❌           |
| **Autofill**                | ❌        | ◐    | ✅    | ✅       | ❌      | ❌           |
| **Auto-apply**              | ❌        | ❌   | ❌    | ❌       | ◐       | ❌           |
| **Structured fit scoring**  | ✅        | ❌   | ◐     | ◐        | ◐       | ◐            |
| **Rich analytics**          | ✅        | ◐    | ◐     | ❌       | ◐       | ◐            |
| **Data ownership**          | ✅        | ◐    | ◐     | ◐        | ◐       | ✅           |
| **Zero subscription**       | ✅        | ◐    | ◐     | ◐        | ◐       | ✅           |
| **No account required**     | ✅        | ❌   | ❌    | ❌       | ❌      | ✅           |

---

## When to choose what

### Choose Huntscope if you…

- Already use **career-ops** (or a compatible markdown layout)
- Want **charts, heatmaps, and filters** over fit scores and statuses
- Need **GitHub companion-repo** viewing without giving broad OAuth access
- Prefer **local-first** data with optional cloud analytics
- Value **read-only safety** — nothing mutates your tracker from the dashboard
- Are a **developer** comfortable with git, markdown, and CLI workflows

### Choose Teal if you…

- Want an **all-in-one CRM** (tracker + resume builder + extension)
- Need **AI resume tailoring** guided by keyword gaps
- Apply across **many boards** and want one-click save from LinkedIn/Indeed
- Prefer a polished SaaS with **unlimited free tracking**

### Choose Huntr if you…

- Think in **kanban** and want drag-and-drop pipeline management
- Need a **contact CRM** (recruiters, hiring managers, networking)
- Want **free autofill** with a visual board (under 100 jobs on free tier)
- Use **mobile** to update application status on the go

### Choose Simplify if you…

- Optimize for **application speed** — autofill is the main event
- Submit **high volume** manually but want 1-minute form reviews
- Want a **free unlimited** autofill extension with basic tracker included

### Choose Jobscan if you…

- Target **enterprise ATS** (Workday, Taleo) and need keyword-level optimization
- Want **match rate on every card** tied to resume scans
- Accept **higher price** ($30–50/mo) for deep ATS reports
- Care more about **resume parsing** than pipeline aesthetics

### Choose Sheets / Notion if you…

- Want **maximum flexibility** and zero vendor dependency
- Don't need charts, scoring, or integrations out of the box
- Are willing to **build and maintain** your own template

### Choose auto-apply (Sonara, LazyApply, etc.) if you…

- Prioritize **volume** over per-application craft
- Accept trade-offs in quality, verification, and platform risk
- Do **not** use career-ops-style evidence-based evaluation

---

## Huntscope vs SaaS: strategic positioning

```
         Data you own (git / markdown)
                    ▲
                    │
    Sheets/Notion   │   Huntscope ★
                    │
    ────────────────┼────────────────► Workflow automation
    Manual          │                  (capture, apply, AI)
                    │
                    │   Teal · Huntr · Simplify · Jobscan
                    │
                    ▼
         Data in vendor cloud
```

| Huntscope is **better** than SaaS at…   | SaaS is **better** than Huntscope at…     |
| --------------------------------------- | ----------------------------------------- |
| Structured career-ops fit visualization | Saving jobs from LinkedIn in one click    |
| Git-native, private companion repos     | Resume building and ATS keyword tools     |
| Read-only trust model                   | Editing tracker without touching markdown |
| No subscription for analytics           | Interview reminders and contact CRM       |
| D3 charts + activity heatmap            | Autofill and auto-apply                   |
| Working from local folder offline       | Onboarding users with no CLI setup        |

---

## Competitive risks for Huntscope

| Risk                                  | Severity | Notes                                                            |
| ------------------------------------- | -------- | ---------------------------------------------------------------- |
| SaaS trackers add markdown/git import | Medium   | Unlikely to match career-ops rubric natively                     |
| career-ops-ui adds hosted mode        | Medium   | Overlaps on analytics; Huntscope wins on read-only + GitHub      |
| Users won't adopt career-ops first    | High     | Huntscope is downstream; not a standalone job search product     |
| Teal/Huntr improve free analytics     | Low      | Their moat is capture + resume, not D3 dashboards                |
| Jobscan keyword focus ages poorly     | Low      | Semantic ATS reduces Jobscan edge; career-ops rubric ages better |

---

## Recommended messaging vs market

| Audience          | Message                                                            |
| ----------------- | ------------------------------------------------------------------ |
| career-ops users  | "The dashboard your repo deserves."                                |
| vs Teal/Huntr     | "Keep your data in git; get better charts than their tracker tab." |
| vs Jobscan        | "Fit scores from evidence, not keyword density."                   |
| vs Sheets         | "Same ownership, zero spreadsheet formulas."                       |
| Privacy-conscious | "Analytics without uploading your CV to another SaaS."             |

---

## Related documents

- [Product positioning](./PRODUCT_POSITIONING.md)
- [Comparison vs career-ops-ui](./COMPARISON_CAREER_OPS_UI.md)
- [Gap analysis v1.1](./GAP_ANALYSIS_V1.1.md)
