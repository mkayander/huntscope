"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { ButtonLoadingIcon } from "~/app/_components/button-loading-icon";
import { LANDING_CTA_BUTTON_CLASS } from "~/app/_components/panel-loading-skeleton";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";
import { performSignOut } from "~/lib/auth/sign-out";

export function OptionalAuthButton() {
  const queryClient = useQueryClient();
  const { data: session, isPending } = authClient.useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

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
        <span>Checking session…</span>
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
            setIsSigningOut(true);
            void performSignOut({
              queryClient,
              clearGitHubCache: true,
            }).finally(() => {
              setIsSigningOut(false);
            });
          }}
        >
          <ButtonLoadingIcon isLoading={isSigningOut} />
          <span>{isSigningOut ? "Signing out" : "Sign out"}</span>
        </Button>
      </div>
    );
  }

  return null;
}
