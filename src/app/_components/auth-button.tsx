"use client";

import { useState } from "react";

import { FeedbackRegion } from "~/app/_components/feedback-region";
import { ButtonLoadingIcon } from "~/app/_components/button-loading-icon";
import { StableButtonLabel } from "~/app/_components/panel-content-slots";
import {
  AUTH_BUTTON_LABEL_PLACEHOLDER,
  LANDING_CTA_BUTTON_CLASS,
} from "~/app/_components/panel-loading-skeleton";
import { Button } from "~/components/ui/button";
import { authClient } from "~/lib/auth-client";

export function AuthButton() {
  const { data: session, isPending } = authClient.useSession();
  const [signInError, setSignInError] = useState<string | null>(null);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const isAuthenticated = Boolean(session?.user);
  const isBusy = isPending || isSigningIn || isSigningOut;

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
      {isAuthenticated ? (
        <div
          className="flex min-h-10 w-full items-center justify-center text-center text-2xl text-white"
          aria-live="polite"
        >
          <p>Logged in as {session?.user?.name ?? session?.user?.email}</p>
        </div>
      ) : null}

      <Button
        type="button"
        variant={isAuthenticated ? "brandSecondary" : "brand"}
        size="cta"
        className={`w-full max-w-sm ${LANDING_CTA_BUTTON_CLASS}`}
        disabled={isBusy}
        onClick={() => {
          if (isAuthenticated) {
            setSignOutError(null);
            setIsSigningOut(true);
            void authClient
              .signOut()
              .then(({ error }) => {
                if (error) {
                  setSignOutError(
                    error.message ?? "Sign-out failed. Try again.",
                  );
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
          void authClient.signIn
            .social({
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
        <ButtonLoadingIcon isLoading={isBusy} />
        <StableButtonLabel placeholder={AUTH_BUTTON_LABEL_PLACEHOLDER}>
          {buttonLabel}
        </StableButtonLabel>
      </Button>

      <FeedbackRegion
        errorTitle={feedbackErrorTitle}
        errorMessage={feedbackErrorMessage}
      />
    </div>
  );
}
