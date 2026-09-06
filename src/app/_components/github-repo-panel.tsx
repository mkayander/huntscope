"use client";

import { ActionButtonRow } from "~/app/_components/action-button-row";
import { ButtonLoadingIcon } from "~/app/_components/button-loading-icon";
import { DataPreview } from "~/app/_components/data-preview";
import { GitHubInstallLink } from "~/app/_components/github-install-link";
import { GitHubInstallStatusBanner } from "~/app/_components/github-install-status-banner";
import {
  GitHubInstallationHealthCheckError,
  useGitHubInstallationHealthCheck,
} from "~/hooks/use-github-installation-health-check";
import {
  PanelDescriptionSlot,
  PanelPrimaryActionSlot,
} from "~/app/_components/panel-content-slots";
import {
  PanelButtonSkeleton,
  PanelDescriptionSkeleton,
  LANDING_CTA_BUTTON_CLASS,
} from "~/app/_components/panel-loading-skeleton";
import {
  PanelSection,
  panelTitleClassName,
} from "~/app/_components/panel-section";
import { Button } from "~/components/ui/button";
import { useHasMounted } from "~/hooks/use-has-mounted";
import { authClient } from "~/lib/auth-client";
import { api } from "~/trpc/react";

function GitHubRepoConnected() {
  const { data: connection, isLoading } = api.github.getConnection.useQuery();
  const { data: preview } = api.github.previewDataFile.useQuery();
  const disconnect = api.github.disconnect.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  if (isLoading || !connection) {
    return <PanelDescriptionSkeleton centered />;
  }

  const primaryRepository = connection.repositories[0];

  return (
    <>
      <GitHubInstallStatusBanner />

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
          <GitHubInstallLink>Change repository</GitHubInstallLink>
        </Button>
        <Button
          type="button"
          variant="brandSecondary"
          size="pill"
          disabled={disconnect.isPending}
          onClick={() => disconnect.mutate()}
        >
          <ButtonLoadingIcon isLoading={disconnect.isPending} />
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
  return (
    <PanelDescriptionSlot variant="landing">
      {!githubConfigured ? (
        <p className="text-sm text-white/70">
          GitHub cloud sync is not configured for this deployment. Use a local
          folder instead.
        </p>
      ) : (
        <p className="text-sm text-white/70">
          Optional: sign in with GitHub below, then install the Huntscope GitHub
          App on exactly one private repository.
        </p>
      )}
    </PanelDescriptionSlot>
  );
}

function GitHubRepoSignedInIdle() {
  return (
    <>
      <GitHubInstallStatusBanner />
      <PanelDescriptionSlot variant="landing">
        <p className="text-sm text-white/70">
          Install the Huntscope GitHub App on one selected repository. Huntscope
          only receives read-only access to the repo you pick.
        </p>
      </PanelDescriptionSlot>
      <PanelPrimaryActionSlot centered>
        <Button
          asChild
          variant="brand"
          size="cta"
          className={LANDING_CTA_BUTTON_CLASS}
        >
          <GitHubInstallLink>Connect GitHub repository</GitHubInstallLink>
        </Button>
      </PanelPrimaryActionSlot>
    </>
  );
}

function GitHubRepoSignedIn() {
  const {
    data: connection,
    isLoading,
    error,
  } = api.github.getConnection.useQuery();

  const shouldHealthCheck = !isLoading && !connection && error == null;
  const { isChecking, errorMessage } = useGitHubInstallationHealthCheck({
    enabled: shouldHealthCheck,
  });

  if (isLoading || isChecking) {
    return (
      <>
        <PanelDescriptionSkeleton centered />
        <PanelPrimaryActionSlot centered>
          <PanelButtonSkeleton variant="landing" centered />
        </PanelPrimaryActionSlot>
      </>
    );
  }

  if (error?.data?.code === "PRECONDITION_FAILED") {
    return (
      <PanelDescriptionSlot variant="landing">
        <p className="text-sm text-white/70">
          GitHub cloud sync is not configured for this deployment.
        </p>
      </PanelDescriptionSlot>
    );
  }

  if (connection) {
    return <GitHubRepoConnected />;
  }

  return (
    <>
      <GitHubInstallationHealthCheckError message={errorMessage} />
      <GitHubInstallStatusBanner />
      <GitHubRepoSignedInIdle />
    </>
  );
}

export function GitHubRepoPanel({
  githubConfigured,
}: {
  githubConfigured: boolean;
}) {
  const hasMounted = useHasMounted();
  const { data: session, isPending } = authClient.useSession();
  const showSessionSkeleton = !hasMounted || isPending;

  return (
    <PanelSection variant="landing">
      <h2 className={panelTitleClassName("landing")}>GitHub repository</h2>

      {showSessionSkeleton ? (
        <PanelDescriptionSkeleton centered />
      ) : session?.user ? (
        <GitHubRepoSignedIn />
      ) : (
        <GitHubRepoSignedOut githubConfigured={githubConfigured} />
      )}
    </PanelSection>
  );
}
