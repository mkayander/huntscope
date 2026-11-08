import { describe, expect, it } from "vitest";

import {
  appendPendingPipelineUrl,
  parsePipelineSections,
} from "~/lib/career-ops/serialize-pipeline";

describe("serialize-pipeline", () => {
  it("appends a pending URL without duplicates", () => {
    const initial = `# Pipeline

## Pending

https://example.com/jobs/1

## Processed

`;

    const first = appendPendingPipelineUrl(
      initial,
      "https://example.com/jobs/2",
    );
    const second = appendPendingPipelineUrl(
      first,
      "https://example.com/jobs/2",
    );

    expect(parsePipelineSections(first).pending).toEqual([
      "https://example.com/jobs/1",
      "https://example.com/jobs/2",
    ]);
    expect(second).toBe(first);
  });

  it("preserves localized headings, comments, and unrelated sections", () => {
    const initial = `# Pipeline

Introducción

## Pendientes

https://example.com/jobs/1

<!-- keep this comment -->

## Procesadas

https://example.com/jobs/done

## Notes

Do not rewrite this section.
`;
    const updated = appendPendingPipelineUrl(
      initial,
      "https://example.com/jobs/2",
    );

    expect(updated).toBe(
      initial.replace(
        "\n\n## Procesadas",
        "\nhttps://example.com/jobs/2\n\n## Procesadas",
      ),
    );
    expect(parsePipelineSections(updated)).toEqual({
      pending: ["https://example.com/jobs/1", "https://example.com/jobs/2"],
      processed: ["https://example.com/jobs/done"],
    });
  });

  it("preserves CRLF line endings", () => {
    const initial = "# Pipeline\r\n\r\n## Pending\r\n\r\n## Processed\r\n\r\n";

    expect(appendPendingPipelineUrl(initial, "https://example.com/job")).toBe(
      "# Pipeline\r\n\r\n## Pending\r\n\r\nhttps://example.com/job\r\n## Processed\r\n\r\n",
    );
  });

  it("appends checklist rows when the pending section uses checkboxes", () => {
    const initial = `# Pipeline

## Pending

- [ ] https://example.com/jobs/1 | Acme | Engineer

## Processed

`;
    const updated = appendPendingPipelineUrl(
      initial,
      "https://example.com/jobs/2",
    );

    expect(updated).toContain("- [ ] https://example.com/jobs/2");
    expect(parsePipelineSections(updated).pending).toEqual([
      "https://example.com/jobs/1",
      "https://example.com/jobs/2",
    ]);
  });

  it("appends inside a fenced pending block", () => {
    const initial = `# Pipeline

## Pending

\`\`\`
https://example.com/jobs/1
\`\`\`

## Processed

`;
    const updated = appendPendingPipelineUrl(
      initial,
      "https://example.com/jobs/2",
    );

    expect(updated).toMatch(
      /```\nhttps:\/\/example\.com\/jobs\/1\nhttps:\/\/example\.com\/jobs\/2\n```/,
    );
  });

  it("leaves duplicate localized URLs byte-for-byte unchanged", () => {
    const initial =
      "# Pipeline\n\n## Offen\n\nhttps://example.com/job\n\n## Verarbeitet\n";

    expect(appendPendingPipelineUrl(initial, "https://example.com/job")).toBe(
      initial,
    );
  });
});
