"use client";

import Link from "next/link";

import { authClient } from "~/lib/auth-client";
import { api } from "~/trpc/react";
import { DataPreview } from "~/app/_components/data-preview";

const statusMessages: Record<string, string> = {
  connected: "Repository connected. Huntscope can now read only the repo you selected.",
  updated: "Repository access updated.",
  "sign-in-required": "Sign in before connecting a repository.",
  "missing-installation": "GitHub did not return an installation ID.",
  "missing-state": "GitHub did not return install state.",
  "expired-state": "The install link expired. Try connecting again.",
  "installation-forbidden":
    "That GitHub App installation is not accessible with your signed-in account.",
  "no-repositories": "No repositories were selected. Pick one repo during install.",
  "callback-failed": "Could not verify the GitHub App installation.",
  "not-configured": "GitHub cloud sync is not configured on this deployment.",
};

function GitHubRepoConnected({ githubStatus }: { githubStatus?: string }) {
  const { data: connection } = api.github.getConnection.useQuery();
  const { data: preview } = api.github.previewDataFile.useQuery();
  const disconnect = api.github.disconnect.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  const statusMessage = githubStatus ? statusMessages[githubStatus] : undefined;

  if (!connection) {
    return null;
  }

  const primaryRepository = connection.repositories[0];

  return (
    <>
      {statusMessage ? (
        <p className="text-center text-sm text-emerald-200">{statusMessage}</p>
      ) : null}

      {connection.repositories.length > 1 ? (
        <p className="text-center text-sm text-amber-200">
          Multiple repositories were selected during install. Huntscope currently
          reads from {primaryRepository?.fullName ?? "the first repository"}.
        </p>
      ) : null}

      <p className="text-center text-sm text-white/80">
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

      {preview ? (
        <DataPreview
          filePath={preview.filePath}
          preview={preview.preview}
          sourceLabel={preview.repositoryFullName}
        />
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
  );
}

function GitHubRepoSignedOut({
  githubConfigured,
}: {
  githubConfigured: boolean;
}) {
  if (!githubConfigured) {
    return (
      <p className="text-center text-sm text-white/70">
        GitHub cloud sync is not configured for this deployment. Use a local
        folder instead.
      </p>
    );
  }

  return (
    <>
      <p className="text-center text-sm text-white/70">
        Optional: sign in with GitHub, then install the Huntscope GitHub App on
        exactly one private repository.
      </p>
      <button
        type="button"
        onClick={() =>
          void authClient.signIn.social({
            provider: "github",
            callbackURL: "/",
          })
        }
        className="rounded-full bg-white/10 px-8 py-3 font-semibold transition hover:bg-white/20"
      >
        Sign in with GitHub
      </button>
    </>
  );
}

function GitHubRepoSignedInIdle() {
  return (
    <>
      <p className="text-center text-sm text-white/70">
        Install the Huntscope GitHub App on one selected repository. Huntscope
        only receives read-only access to the repo you pick.
      </p>
      <Link
        href="/api/github/install"
        className="rounded-full bg-white/10 px-8 py-3 font-semibold transition hover:bg-white/20"
      >
        Connect GitHub repository
      </Link>
    </>
  );
}

function GitHubRepoSignedIn({ githubStatus }: { githubStatus?: string }) {
  const { data: connection, isLoading, error } = api.github.getConnection.useQuery();

  if (isLoading) {
    return <p className="text-sm text-white/70">Loading GitHub connection…</p>;
  }

  if (error?.data?.code === "PRECONDITION_FAILED") {
    return (
      <p className="text-center text-sm text-white/70">
        GitHub cloud sync is not configured for this deployment.
      </p>
    );
  }

  if (connection) {
    return <GitHubRepoConnected githubStatus={githubStatus} />;
  }

  return <GitHubRepoSignedInIdle />;
}

export function GitHubRepoPanel({
  githubStatus,
  githubConfigured,
}: {
  githubStatus?: string;
  githubConfigured: boolean;
}) {
  const { data: session, isPending } = authClient.useSession();

  return (
    <section className="flex w-full flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-lg font-semibold text-white">GitHub repository</h2>

      {isPending ? (
        <p className="text-sm text-white/70">Checking session…</p>
      ) : session?.user ? (
        <GitHubRepoSignedIn githubStatus={githubStatus} />
      ) : (
        <GitHubRepoSignedOut githubConfigured={githubConfigured} />
      )}
    </section>
  );
}
