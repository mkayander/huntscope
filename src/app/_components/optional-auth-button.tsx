"use client";

import { authClient } from "~/lib/auth-client";

export function OptionalAuthButton() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <span className="rounded-full bg-white/10 px-6 py-2 text-sm font-semibold">
        Checking session…
      </span>
    );
  }

  if (session?.user) {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-white/70">
          Signed in as {session.user.name ?? session.user.email}
        </p>
        <button
          type="button"
          onClick={() => void authClient.signOut()}
          className="rounded-full bg-white/10 px-6 py-2 text-sm font-semibold transition hover:bg-white/20"
        >
          Sign out
        </button>
      </div>
    );
  }

  return null;
}
