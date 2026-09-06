"use client";

import { ButtonLoadingIcon } from "~/app/_components/button-loading-icon";
import { LANDING_CTA_BUTTON_CLASS } from "~/app/_components/panel-loading-skeleton";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";

export function OptionalAuthButton() {
  const { data: session, isPending } = authClient.useSession();

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
          onClick={() => void authClient.signOut()}
        >
          Sign out
        </Button>
      </div>
    );
  }

  return null;
}
