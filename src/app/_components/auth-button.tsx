"use client";

import { useState } from "react";

import { buttonPrimaryClassName, buttonSecondaryClassName } from "~/app/_components/button-styles";
import { ErrorAlert } from "~/app/_components/error-alert";
import { authClient } from "~/lib/auth-client";

export function AuthButton() {
  const { data: session, isPending } = authClient.useSession();
  const [signInError, setSignInError] = useState<string | null>(null);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (isPending) {
    return (
      <span className="rounded-full bg-white/15 px-10 py-3 text-sm font-semibold text-white/70 ring-1 ring-white/20">
        Loading session…
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
          disabled={isSigningOut}
          onClick={() => {
            setSignOutError(null);
            setIsSigningOut(true);
            void authClient
              .signOut()
              .then(({ error }) => {
                if (error) {
                  setSignOutError(error.message ?? "Sign-out failed. Try again.");
                }
              })
              .catch(() => {
                setSignOutError("Sign-out failed. Try again.");
              })
              .finally(() => {
                setIsSigningOut(false);
              });
          }}
          className={buttonSecondaryClassName}
        >
          {isSigningOut ? "Signing out…" : "Sign out"}
        </button>
        {signOutError ? (
          <ErrorAlert title="Could not sign out" message={signOutError} />
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        disabled={isSigningIn}
        onClick={() => {
          setSignInError(null);
          setIsSigningIn(true);
          void authClient
            .signIn.social({
              provider: "github",
              callbackURL: "/",
            })
            .then(({ error }) => {
              if (error) {
                setSignInError(
                  error.message ??
                    "GitHub sign-in failed. Check your OAuth app callback URL and try again.",
                );
              }
            })
            .catch(() => {
              setSignInError(
                "GitHub sign-in failed. Check your OAuth app callback URL and try again.",
              );
            })
            .finally(() => {
              setIsSigningIn(false);
            });
        }}
        className={`${buttonPrimaryClassName} px-10 py-3 text-base`}
      >
        {isSigningIn ? "Redirecting to GitHub…" : "Sign in with GitHub"}
      </button>
      {signInError ? (
        <ErrorAlert title="Could not sign in with GitHub" message={signInError} />
      ) : null}
    </div>
  );
}
