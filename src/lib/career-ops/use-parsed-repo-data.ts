"use client";

import { useEffect, useState } from "react";

import type { ParsedCareerOpsRepoData } from "~/lib/career-ops/parse-repo-data";
import type { RawCareerOpsRepoData } from "~/lib/career-ops/types";
import { parseRepoDataInWorker } from "~/lib/career-ops/worker-client";

type UseParsedRepoDataResult = {
  parsed: ParsedCareerOpsRepoData | null;
  isParsing: boolean;
  parseError: string | null;
};

export function useParsedRepoData(
  raw: RawCareerOpsRepoData | undefined,
): UseParsedRepoDataResult {
  const [parsed, setParsed] = useState<ParsedCareerOpsRepoData | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    if (!raw) {
      setParsed(null);
      setIsParsing(false);
      setParseError(null);
      return;
    }

    let cancelled = false;
    setIsParsing(true);
    setParseError(null);

    void parseRepoDataInWorker({
      applicationsMarkdown: raw.applicationsMarkdown,
      pipelineMarkdown: raw.pipelineMarkdown,
    })
      .then((result) => {
        if (cancelled) {
          return;
        }

        setParsed(result);
        setIsParsing(false);
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        setParsed(null);
        setIsParsing(false);
        setParseError(
          error instanceof Error ? error.message : "Could not parse repository data",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [raw]);

  return {
    parsed,
    isParsing,
    parseError,
  };
}
