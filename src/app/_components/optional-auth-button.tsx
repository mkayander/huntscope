"use client";

import { Loader2 } from "lucide-react";

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
        className="pointer-events-none"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
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
