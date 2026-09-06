"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { FeedbackRegion } from "~/app/_components/feedback-region";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";
import { cn } from "~/lib/utils";

const SESSION_BUTTON_CLASS =
  "min-h-12 w-full min-w-[15.5rem] max-w-sm justify-center px-8";

export function AuthButton() {
  const { data: session, isPending } = authClient.useSession();
  const [signInError, setSignInError] = useState<string | null>(null);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isAuthenticated = Boolean(session?.user);
  const isBusy = isPending || isSigningIn || isSigningOut;
  const sessionLabel = isPending
    ? "Checking session…"
    : isAuthenticated
      ? `Logged in as ${session?.user?.name ?? session?.user?.email}`
      : null;

  const buttonLabel = isPending
    ? "Loading session"
    : isAuthenticated
      ? isSigningOut
        ? "Signing out"
        : "Sign out"
      : isSigningIn
        ? "Redirecting to GitHub"
        : "Sign in with GitHub";

  const feedbackErrorTitle = signOutError
    ? "Could not sign out"
    : signInError
      ? "Could not sign in with GitHub"
      : null;
  const feedbackErrorMessage = signOutError ?? signInError;

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-4">
      {isPending || isAuthenticated ? (
        <div
          className={cn(
            "flex min-h-10 w-full items-center justify-center text-center",
            isAuthenticated ? "text-2xl text-white" : "text-sm text-white/60",
          )}
          aria-live="polite"
        >
          <p>{sessionLabel}</p>
        </div>
      ) : null}

      <Button
        type="button"
        variant={isAuthenticated ? "brandSecondary" : "brand"}
        size="cta"
        className={SESSION_BUTTON_CLASS}
        disabled={isBusy}
        onClick={() => {
          if (isAuthenticated) {
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
            return;
          }

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
      >
        {isBusy ? <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" /> : null}
        <span>{buttonLabel}</span>
      </Button>

      <FeedbackRegion
        errorTitle={feedbackErrorTitle}
        errorMessage={feedbackErrorMessage}
      />
    </div>
  );
}
