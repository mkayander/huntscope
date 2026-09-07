"use client";

import { clickableLinkClassName } from "~/components/ui/interaction";
import {
  getRoleDisplayLabel,
  resolveJobPostingUrl,
} from "~/lib/career-ops/application-job-posting";
import type { ApplicationEntry } from "~/lib/career-ops/types";
import { cn } from "~/lib/utils";

type ApplicationRoleLinkProps = {
  application: ApplicationEntry;
  reportSourceUrl?: string | null;
  className?: string;
};

export function ApplicationRoleLink({
  application,
  reportSourceUrl = null,
  className,
}: ApplicationRoleLinkProps) {
  const label = getRoleDisplayLabel(application.role);
  const href = resolveJobPostingUrl(application, reportSourceUrl);

  if (!href) {
    return (
      <span className={cn("truncate", className)} title={label}>
        {label}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(clickableLinkClassName, "truncate", className)}
      title={label}
    >
      {label}
    </a>
  );
}
