# Career-ops data compatibility

Huntscope can open either a full career-ops project or a companion data
repository. This document describes the supported layout and write guarantees.

## Layout resolution

Huntscope looks for tracker files in this order:

1. `data/applications.md`
2. `applications.md`
3. `data/pipeline.md`
4. `pipeline.md`

If the repository root contains a `.career-ops-data` file, its first line may
point to a repository-relative data root. Absolute paths and paths containing a
`..` segment are rejected. All tracker, report, and output paths are then
resolved below that data root.

A directory can also be recognized from known files in `data/`, including
`scan-history.tsv`, `scan-runs.tsv`, `follow-ups.md`, `blacklist.md`,
`salary-observations.tsv`, and `assessments.tsv`.

## Applications table

The applications table must contain `#`, `Company`, and `Role` columns.
Huntscope recognizes the following columns by header name (English labels plus
career-ops localized aliases such as Spanish `Empresa` / `Puesto` / `Estado` and
English variants `Position` / `Stage` / `Link`):

- `#`
- `Date`
- `Company`
- `Via`
- `Role`
- `Location`
- `Score`
- `Status`
- `PDF`
- `Report`
- `Notes`
- `URL`

Columns may be reordered. The optional `Via` column is displayed only when at
least one row has a meaningful value.

When a local status is edited, Huntscope changes only that row's `Status` cell.
Frontmatter, prose, comments, custom columns, column alignment, escaped pipes,
and line endings remain unchanged.

## Pipeline

Pending and processed headings are recognized in English, Spanish, German, and
French:

| Language | Pending      | Processed     |
| -------- | ------------ | ------------- |
| English  | `Pending`    | `Processed`   |
| Spanish  | `Pendientes` | `Procesadas`  |
| German   | `Offen`      | `Verarbeitet` |
| French   | `En attente` | `Traitées`    |

Pending sections may use plain URL lines, fenced code blocks, or checklist rows
(`- [ ] url | company | title | …`). Adding a local URL preserves that shape,
heading language, comments, unrelated sections, and line endings. An existing URL
is not added twice.

## Local write safety

Local writes are available only for directory connections in browsers that
support the File System Access API. Huntscope requests read/write permission at
the time of the first edit.

Immediately before writing, Huntscope compares the file on disk with the
version it loaded. If another program changed or created the file, the write is
stopped and the user must reload the folder. This avoids silently overwriting
newer changes.

GitHub repository connections remain read-only.
