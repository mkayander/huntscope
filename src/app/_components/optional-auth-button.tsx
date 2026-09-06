"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { ButtonLoadingIcon } from "~/app/_components/button-loading-icon";
import { StableButtonLabel } from "~/app/_components/panel-content-slots";
import { LANDING_CTA_BUTTON_CLASS } from "~/app/_components/panel-loading-skeleton";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";
import { performSignOut } from "~/lib/auth/sign-out";

export function OptionalAuthButton() {
  const queryClient = useQueryClient();
  const { data: session, isPending } = authClient.useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  if (isPending) {
    return (
      <Button
        type="button"
        variant="brandSecondary"
        size="pill"
        disabled
        className={LANDING_CTA_BUTTON_CLASS}
      >
        <ButtonLoadingIcon isLoading />
        <StableButtonLabel placeholder="Checking session…">
          Checking session…
        </StableButtonLabel>
      </Button>
    );
  }

  if (session?.user) {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-white/70">
          Signed in as {session.user.name ?? session.user.email}
        </p>
        <Button
          type="button"
          variant="brandSecondary"
          size="pill"
          disabled={isSigningOut}
          onClick={() => {
            setSignOutError(null);
            setIsSigningOut(true);
            void performSignOut({
              queryClient,
              clearGitHubCache: true,
            })
              .then((result) => {
                if (!result.ok) {
                  setSignOutError(result.errorMessage);
                }
              })
              .catch(() => {
                setSignOutError("Sign-out failed. Try again.");
              })
              .finally(() => {
                setIsSigningOut(false);
              });
          }}
        >
          <ButtonLoadingIcon isLoading={isSigningOut} />
          <StableButtonLabel placeholder="Signing out">
            {isSigningOut ? "Signing out" : "Sign out"}
          </StableButtonLabel>
        </Button>
        {signOutError ? (
          <p className="text-sm text-red-200" role="alert">
            {signOutError}
          </p>
        ) : null}
      </div>
    );
  }

  return null;
}
