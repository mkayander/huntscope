import { extractPipelineLineUrl } from "~/lib/career-ops/pipeline-line-url";

export function collectPipelineSectionUrls(sectionLines: string[]): string[] {
  const text = sectionLines.join("\n");
  const fenceMatch = /```([\s\S]*?)```/.exec(text);
  const block = fenceMatch?.[1] ?? text;
  const urls: string[] = [];

  for (const line of block.split("\n")) {
    const url = extractPipelineLineUrl(line);
    if (url && !urls.includes(url)) {
      urls.push(url);
    }
  }

  return urls;
}
