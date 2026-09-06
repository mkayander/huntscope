"use client";

import Link from "next/link";

import { api } from "~/trpc/react";

const statusMessages: Record<string, string> = {
  connected: "Repository connected. Huntscope can now read only the repo you selected.",
  updated: "Repository access updated.",
  "sign-in-required": "Sign in before connecting a repository.",
  "missing-installation": "GitHub did not return an installation ID.",
  "state-mismatch": "GitHub install state did not match your session.",
  "expired-state": "The install link expired. Try connecting again.",
  "no-repositories": "No repositories were selected. Pick one repo during install.",
  "callback-failed": "Could not verify the GitHub App installation.",
};

export function ConnectRepoPanel({
  githubStatus,
}: {
  githubStatus?: string;
}) {
  const [connection] = api.github.getConnection.useSuspenseQuery();
  const [preview] = api.github.previewDataFile.useSuspenseQuery();
  const disconnect = api.github.disconnect.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  const statusMessage = githubStatus ? statusMessages[githubStatus] : undefined;

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
      {statusMessage ? (
        <p className="text-center text-sm text-emerald-200">{statusMessage}</p>
      ) : null}

      {connection ? (
        <>
          <p className="text-center text-lg text-white">
            Connected repository
            {connection.repositories.length === 1 ? "" : "ies"}
          </p>
          <ul className="w-full space-y-2 text-center text-white/80">
            {connection.repositories.map((repository) => (
              <li key={repository.id} className="font-mono text-sm">
                {repository.fullName}
              </li>
            ))}
          </ul>
          {preview?.preview ? (
            <div className="w-full rounded-xl bg-black/30 p-4 text-left">
              <p className="mb-2 text-xs uppercase tracking-wide text-white/50">
                Preview: {preview.filePath}
              </p>
              <pre className="overflow-x-auto text-sm text-emerald-100">
                {preview.preview}
              </pre>
            </div>
          ) : preview ? (
            <p className="text-center text-sm text-white/60">
              Connected to {preview.repositoryFullName}. No {preview.filePath}{" "}
              found yet.
            </p>
          ) : null}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/api/github/install"
              className="rounded-full bg-white/10 px-6 py-2 text-sm font-semibold transition hover:bg-white/20"
            >
              Change repository
            </Link>
            <button
              type="button"
              onClick={() => disconnect.mutate()}
              disabled={disconnect.isPending}
              className="rounded-full bg-white/10 px-6 py-2 text-sm font-semibold transition hover:bg-white/20 disabled:opacity-50"
            >
              Disconnect
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-center text-lg text-white">
            Connect your job-search data repository
          </p>
          <p className="text-center text-sm text-white/70">
            Sign in only uses your GitHub profile. Repository access is granted
            separately through a GitHub App install, where you choose exactly
            one private repo.
          </p>
          <Link
            href="/api/github/install"
            className="rounded-full bg-[hsl(280,100%,70%)] px-8 py-3 font-semibold text-[#15162c] transition hover:opacity-90"
          >
            Connect repository
          </Link>
        </>
      )}
    </div>
  );
}
