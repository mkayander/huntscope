"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";

import { ActionButtonRow } from "~/app/_components/action-button-row";
import { DataPreview } from "~/app/_components/data-preview";
import { GitHubStatusMessage } from "~/app/_components/github-status-message";
import {
  PanelSection,
  panelTitleClassName,
} from "~/app/_components/panel-section";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";
import { api } from "~/trpc/react";

function GitHubRepoConnected({ githubStatus }: { githubStatus?: string }) {
  const { data: connection } = api.github.getConnection.useQuery();
  const { data: preview } = api.github.previewDataFile.useQuery();
  const disconnect = api.github.disconnect.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  if (!connection) {
    return null;
  }

  const primaryRepository = connection.repositories[0];

  return (
    <>
      <GitHubStatusMessage status={githubStatus} />

      {connection.repositories.length > 1 ? (
        <p className="text-center text-sm text-amber-200">
          Multiple repositories were selected during install. Huntscope
          currently reads from{" "}
          {primaryRepository?.fullName ?? "the first repository"}.
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

      <ActionButtonRow centered>
        <Button asChild variant="brandSecondary" size="pill">
          <Link href="/api/github/install">Change repository</Link>
        </Button>
        <Button
          type="button"
          variant="brandSecondary"
          size="pill"
          disabled={disconnect.isPending}
          onClick={() => disconnect.mutate()}
        >
          {disconnect.isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          <span>{disconnect.isPending ? "Disconnecting…" : "Disconnect"}</span>
        </Button>
      </ActionButtonRow>
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
    <p className="text-center text-sm text-white/70">
      Optional: sign in with GitHub below, then install the Huntscope GitHub App
      on exactly one private repository.
    </p>
  );
}

function GitHubRepoSignedInIdle() {
  return (
    <>
      <p className="text-center text-sm text-white/70">
        Install the Huntscope GitHub App on one selected repository. Huntscope
        only receives read-only access to the repo you pick.
      </p>
      <Button
        asChild
        variant="brand"
        size="cta"
        className="min-w-[15.5rem] justify-center"
      >
        <Link href="/api/github/install">Connect GitHub repository</Link>
      </Button>
    </>
  );
}

function GitHubRepoSignedIn({ githubStatus }: { githubStatus?: string }) {
  const {
    data: connection,
    isLoading,
    error,
  } = api.github.getConnection.useQuery();

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
    <PanelSection variant="landing">
      <h2 className={panelTitleClassName("landing")}>GitHub repository</h2>

      {isPending ? (
        <p className="text-sm text-white/70">Checking session…</p>
      ) : session?.user ? (
        <GitHubRepoSignedIn githubStatus={githubStatus} />
      ) : (
        <GitHubRepoSignedOut githubConfigured={githubConfigured} />
      )}
    </PanelSection>
  );
}
