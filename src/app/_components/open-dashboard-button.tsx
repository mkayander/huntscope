import Link from "next/link";

import { Button } from "~/components/ui/button";
import { LANDING_CTA_BUTTON_CLASS } from "~/app/_components/panel-loading-skeleton";
import { DASHBOARD_PATH } from "~/lib/routes";
import { cn } from "~/lib/utils";

type OpenDashboardButtonProps = {
  className?: string;
};

export function OpenDashboardButton({ className }: OpenDashboardButtonProps) {
  return (
    <Button
      asChild
      variant="brand"
      size="cta"
      className={cn(LANDING_CTA_BUTTON_CLASS, className)}
    >
      <Link href={DASHBOARD_PATH}>Open dashboard</Link>
    </Button>
  );
}
