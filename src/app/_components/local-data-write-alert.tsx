"use client";

import { ButtonLoadingIcon } from "~/app/_components/button-loading-icon";
import { ErrorAlert } from "~/app/_components/error-alert";
import { Button } from "~/components/ui/button";
import { isStaleLocalWriteConflict } from "~/lib/career-ops/local-write";

type LocalDataWriteAlertProps = {
  error: string | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  onDismiss?: () => void;
};

export function LocalDataWriteAlert({
  error,
  isRefreshing,
  onRefresh,
  onDismiss,
}: LocalDataWriteAlertProps) {
  if (!error) {
    return null;
  }

  const staleConflict = isStaleLocalWriteConflict(error);

  return (
    <div className="mt-3 space-y-2">
      <ErrorAlert
        title={staleConflict ? "File changed on disk" : "Could not save"}
        message={error}
      />
      <div className="flex flex-wrap gap-2">
        {staleConflict ? (
          <Button
            type="button"
            variant="brand"
            size="pill"
            disabled={isRefreshing}
            onClick={() => void onRefresh()}
          >
            <ButtonLoadingIcon isLoading={isRefreshing} />
            Reload folder
          </Button>
        ) : null}
        {onDismiss ? (
          <Button
            type="button"
            variant="brandSecondary"
            size="pill"
            onClick={onDismiss}
          >
            Dismiss
          </Button>
        ) : null}
      </div>
    </div>
  );
}
