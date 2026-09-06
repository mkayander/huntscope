"use client";

import { useState, type ComponentProps, type ReactNode } from "react";

import { ButtonLoadingIcon } from "~/app/_components/button-loading-icon";
import { StableButtonLabel } from "~/app/_components/panel-content-slots";
import { AUTH_BUTTON_LABEL_PLACEHOLDER } from "~/app/_components/panel-loading-skeleton";
import { GitHubInstallLink } from "~/app/_components/github-install-link";
import { Button } from "~/components/ui/button";

type GitHubInstallButtonProps = Omit<
  ComponentProps<typeof Button>,
  "asChild" | "onClick" | "children"
> & {
  children: ReactNode;
  href?: string;
  loadingLabel?: string;
  labelPlaceholder?: string;
};

export function GitHubInstallButton({
  children,
  href,
  loadingLabel = "Redirecting to GitHub",
  labelPlaceholder = AUTH_BUTTON_LABEL_PLACEHOLDER,
  disabled,
  ...buttonProps
}: GitHubInstallButtonProps) {
  const [isNavigating, setIsNavigating] = useState(false);

  return (
    <Button
      {...buttonProps}
      asChild
      disabled={Boolean(disabled) || isNavigating}
      aria-busy={isNavigating}
    >
      <GitHubInstallLink
        href={href}
        onClick={(event) => {
          if (
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          ) {
            return;
          }

          setIsNavigating(true);
        }}
        aria-disabled={Boolean(disabled) || isNavigating ? true : undefined}
      >
        <ButtonLoadingIcon isLoading={isNavigating} />
        <StableButtonLabel placeholder={labelPlaceholder}>
          {isNavigating ? loadingLabel : children}
        </StableButtonLabel>
      </GitHubInstallLink>
    </Button>
  );
}
