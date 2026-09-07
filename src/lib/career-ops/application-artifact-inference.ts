import type { ApplicationEntry, RepoDataFile } from "~/lib/career-ops/types";

const COMPANY_TOKEN_STOP_WORDS = new Set([
  "ag",
  "and",
  "bv",
  "co",
  "company",
  "corp",
  "corporation",
  "for",
  "gmbh",
  "group",
  "inc",
  "limited",
  "ltd",
  "plc",
  "sa",
  "the",
]);

export function hasLinkedArtifactValue(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed !== "—" && trimmed !== "-";
}

export function getFileStem(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "").toLowerCase();
}

export function getCompanySearchTokens(company: string): string[] {
  const tokens = company
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(
      (token) => token.length > 0 && !COMPANY_TOKEN_STOP_WORDS.has(token),
    );

  return [...new Set(tokens)];
}

/** @deprecated Prefer getCompanySearchTokens for multi-token matching. */
export function getCompanySearchToken(company: string): string | null {
  return getCompanySearchTokens(company)[0] ?? null;
}

export function matchesNumberedFilePrefix(
  fileName: string,
  applicationNum: number,
): boolean {
  const paddedPrefix = `${applicationNum}`.padStart(3, "0");
  return (
    fileName.startsWith(`${paddedPrefix}-`) ||
    fileName.startsWith(`${applicationNum}-`)
  );
}

export function findFilesByNumberPrefix(
  files: readonly RepoDataFile[],
  applicationNum: number,
): RepoDataFile[] {
  return files.filter(
    (file) =>
      file.type === "file" &&
      matchesNumberedFilePrefix(file.name, applicationNum),
  );
}

function pickNewestFileName(
  files: readonly RepoDataFile[],
): RepoDataFile | null {
  if (files.length === 0) {
    return null;
  }

  return (
    [...files].sort((left, right) => right.name.localeCompare(left.name))[0] ??
    null
  );
}

type CompanyMatchScore = {
  file: RepoDataFile;
  matchedTokenCount: number;
  longestTokenLength: number;
};

function scoreCompanyFileMatch(
  file: RepoDataFile,
  application: ApplicationEntry,
): CompanyMatchScore | null {
  const stem = getFileStem(file.name);
  const tokens = getCompanySearchTokens(application.company);

  if (tokens.length === 0) {
    return null;
  }

  const matchedTokens = tokens.filter((token) => stem.includes(token));

  if (matchedTokens.length === 0) {
    return null;
  }

  return {
    file,
    matchedTokenCount: matchedTokens.length,
    longestTokenLength: Math.max(...matchedTokens.map((token) => token.length)),
  };
}

function compareCompanyMatchScores(
  left: CompanyMatchScore,
  right: CompanyMatchScore,
): number {
  if (right.matchedTokenCount !== left.matchedTokenCount) {
    return right.matchedTokenCount - left.matchedTokenCount;
  }

  if (right.longestTokenLength !== left.longestTokenLength) {
    return right.longestTokenLength - left.longestTokenLength;
  }

  return right.file.name.localeCompare(left.file.name);
}

function pickUnambiguousCompanyMatches(
  scored: CompanyMatchScore[],
): RepoDataFile[] {
  if (scored.length === 0) {
    return [];
  }

  const best = scored[0];
  if (!best) {
    return [];
  }

  const topTier = scored.filter(
    (entry) =>
      entry.matchedTokenCount === best.matchedTokenCount &&
      entry.longestTokenLength === best.longestTokenLength,
  );

  if (topTier.length !== 1) {
    return [];
  }

  return [topTier[0]?.file].filter(
    (file): file is RepoDataFile => file != null,
  );
}

export function findFilesByCompanyTokens(
  files: readonly RepoDataFile[],
  application: ApplicationEntry,
): RepoDataFile[] {
  const scored = files
    .map((file) => scoreCompanyFileMatch(file, application))
    .filter((entry): entry is CompanyMatchScore => entry !== null)
    .sort(compareCompanyMatchScores);

  return pickUnambiguousCompanyMatches(scored);
}

type ApplicationMatchScore = {
  application: ApplicationEntry;
  matchedTokenCount: number;
  longestTokenLength: number;
};

function scoreApplicationForFile(
  file: RepoDataFile,
  application: ApplicationEntry,
): ApplicationMatchScore | null {
  const stem = getFileStem(file.name);
  const tokens = getCompanySearchTokens(application.company);
  const matchedTokens = tokens.filter((token) => stem.includes(token));

  if (matchedTokens.length === 0) {
    return null;
  }

  return {
    application,
    matchedTokenCount: matchedTokens.length,
    longestTokenLength: Math.max(...matchedTokens.map((token) => token.length)),
  };
}

function compareApplicationMatchScores(
  left: ApplicationMatchScore,
  right: ApplicationMatchScore,
): number {
  if (right.matchedTokenCount !== left.matchedTokenCount) {
    return right.matchedTokenCount - left.matchedTokenCount;
  }

  if (right.longestTokenLength !== left.longestTokenLength) {
    return right.longestTokenLength - left.longestTokenLength;
  }

  return left.application.num - right.application.num;
}

export function inferFileForApplication(
  application: ApplicationEntry,
  files: readonly RepoDataFile[],
  extension: string,
): RepoDataFile | null {
  const candidates = files.filter(
    (file) =>
      file.type === "file" && file.name.toLowerCase().endsWith(extension),
  );

  const numbered = findFilesByNumberPrefix(candidates, application.num);
  if (numbered.length > 0) {
    return pickNewestFileName(numbered);
  }

  const companyMatches = findFilesByCompanyTokens(candidates, application);
  return companyMatches[0] ?? null;
}

export function inferApplicationForFile(
  file: RepoDataFile,
  applications: readonly ApplicationEntry[],
): ApplicationEntry | null {
  const scored = applications
    .map((application) => scoreApplicationForFile(file, application))
    .filter((entry): entry is ApplicationMatchScore => entry !== null)
    .sort(compareApplicationMatchScores);

  if (scored.length === 0) {
    return null;
  }

  const best = scored[0];
  if (!best) {
    return null;
  }

  const topTier = scored.filter(
    (entry) =>
      entry.matchedTokenCount === best.matchedTokenCount &&
      entry.longestTokenLength === best.longestTokenLength,
  );

  if (topTier.length !== 1) {
    return null;
  }

  return topTier[0]?.application ?? null;
}
