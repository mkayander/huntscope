import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import { interactionCursorMarkers } from "~/components/ui/interaction";

const SAFE_INTRINSIC_TAGS = new Set([
  "button",
  "a",
  "summary",
  "label",
  "input",
  "select",
  "textarea",
]);

type ElementContext = {
  tag: string;
  attributes: string;
  line: number;
};

function collectTsxFiles(dir: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...collectTsxFiles(fullPath));
      continue;
    }

    if (entry.endsWith(".tsx")) {
      files.push(fullPath);
    }
  }

  return files;
}

function hasCursorMarker(text: string): boolean {
  return interactionCursorMarkers.some((marker) => text.includes(marker));
}

export function getIntrinsicElementWithOnClick(
  source: string,
  onClickIndex: number,
): ElementContext | null {
  const windowStart = Math.max(0, onClickIndex - 2000);
  const slice = source.slice(windowStart, onClickIndex + 800);
  const relativeOnClick = onClickIndex - windowStart;
  const beforeOnClick = slice.slice(0, relativeOnClick);
  const lastOpen = beforeOnClick.lastIndexOf("<");

  if (lastOpen === -1) {
    return null;
  }

  const fromOpen = slice.slice(lastOpen);
  const tagEnd = fromOpen.indexOf(">");

  if (tagEnd === -1) {
    return null;
  }

  const openingTag = fromOpen.slice(0, tagEnd + 1);

  if (!openingTag.includes("onClick")) {
    return null;
  }

  const tagPattern = /^<([a-z][\w-]*)\b([\s\S]*)>$/;
  const match = tagPattern.exec(openingTag);

  if (!match) {
    return null;
  }

  const tag = match[1];
  if (!tag) {
    return null;
  }

  const attributes = match[2] ?? "";
  const absoluteIndex = windowStart + lastOpen;
  const line = source.slice(0, absoluteIndex).split("\n").length;

  return { tag, attributes, line };
}

function isSafeIntrinsicElement(element: ElementContext): boolean {
  if (SAFE_INTRINSIC_TAGS.has(element.tag)) {
    return true;
  }

  if (hasCursorMarker(element.attributes)) {
    return true;
  }

  if (/\brole\s*=\s*["']button["']/.test(element.attributes)) {
    return true;
  }

  return false;
}

export function verifyInteractionCursors(rootDir: string): string[] {
  const srcDir = join(rootDir, "src");
  const files = collectTsxFiles(srcDir);
  const issues: string[] = [];

  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const relPath = relative(rootDir, file);
    const onClickRegex = /\bonClick\s*=/g;
    let match: RegExpExecArray | null = onClickRegex.exec(source);

    while (match) {
      const element = getIntrinsicElementWithOnClick(source, match.index);

      if (element && !isSafeIntrinsicElement(element)) {
        issues.push(
          `${relPath}:${element.line} <${element.tag}> has onClick but no cursor-pointer / clickable* styling`,
        );
      }

      match = onClickRegex.exec(source);
    }
  }

  return issues;
}
