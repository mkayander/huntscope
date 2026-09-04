"use client";

import { authClient } from "~/lib/auth-client";

export function AuthButton() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <span className="rounded-full bg-white/10 px-10 py-3 font-semibold">
        Loading…
      </span>
    );
  }

  if (session?.user) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-center text-2xl text-white">
          Logged in as {session.user.name ?? session.user.email}
        </p>
        <button
          type="button"
          onClick={() => void authClient.signOut()}
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() =>
        void authClient.signIn.social({
          provider: "github",
          callbackURL: "/",
        })
      }
      className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
    >
      Sign in with GitHub
    </button>
  );
}
