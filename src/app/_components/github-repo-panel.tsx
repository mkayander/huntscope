"use client";

import { ButtonLoadingIcon } from "~/app/_components/button-loading-icon";
import { DataPreview } from "~/app/_components/data-preview";
import { GitHubInstallButton } from "~/app/_components/github-install-button";
import { OpenDashboardButton } from "~/app/_components/open-dashboard-button";
import {
  GitHubInstallationHealthCheckError,
  useGitHubInstallationHealthCheck,
} from "~/hooks/use-github-installation-health-check";
import {
  PanelDescriptionSlot,
  PanelPrimaryActionSlot,
  StableButtonLabel,
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
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

const CONNECTED_PANEL_WIDTH_CLASS = "w-full max-w-sm";

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
    <div
      className={cn(
        "mx-auto flex flex-col items-stretch gap-4",
        CONNECTED_PANEL_WIDTH_CLASS,
      )}
    >
      {connection.repositories.length > 1 ? (
        <p className="text-center text-sm text-amber-200">
          Multiple repositories were selected during install. Huntscope
          currently reads from{" "}
          {primaryRepository?.fullName ?? "the first repository"}.
        </p>
      ) : null}

      <div className="flex flex-col gap-1 text-center">
        <p className="text-xs text-white/50">
          Connected repository
          {connection.repositories.length === 1 ? "" : "ies"}
        </p>
        <ul className="space-y-1">
          {connection.repositories.map((repository) => (
            <li
              key={repository.id}
              className="truncate font-mono text-sm text-white/90"
            >
              {repository.fullName}
            </li>
          ))}
        </ul>
      </div>

      {preview ? (
        <DataPreview
          filePath={preview.filePath}
          preview={preview.preview}
          sourceLabel={preview.repositoryFullName}
          className="max-w-none"
        />
      ) : null}

      <div className="flex flex-col gap-3">
        <OpenDashboardButton className="w-full min-w-0" />
        <div className="grid grid-cols-2 gap-3">
          <GitHubInstallButton
            variant="brandSecondary"
            size="pill"
            className="w-full min-w-0"
            loadingLabel="Opening GitHub…"
            labelPlaceholder="Change repository"
          >
            Change repository
          </GitHubInstallButton>
          <Button
            type="button"
            variant="brandSecondary"
            size="pill"
            className="w-full min-w-0"
            disabled={disconnect.isPending}
            onClick={() => disconnect.mutate()}
          >
            <ButtonLoadingIcon isLoading={disconnect.isPending} />
            <StableButtonLabel labels={["Disconnect", "Disconnecting…"]}>
              {disconnect.isPending ? "Disconnecting…" : "Disconnect"}
            </StableButtonLabel>
          </Button>
        </div>
      </div>
    </div>
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
      <PanelDescriptionSlot variant="landing">
        <p className="text-sm text-white/70">
          Install the Huntscope GitHub App on one selected repository. Huntscope
          only receives read-only access to the repo you pick.
        </p>
      </PanelDescriptionSlot>
      <PanelPrimaryActionSlot centered>
        <GitHubInstallButton
          variant="brand"
          size="cta"
          className={LANDING_CTA_BUTTON_CLASS}
        >
          Connect GitHub repository
        </GitHubInstallButton>
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
