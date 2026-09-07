"use client";

import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { DashboardPeriodCalendar } from "~/app/_components/dashboard-period-calendar";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  DASHBOARD_PERIOD_PRESETS,
  getDashboardPeriodLabel,
  isDashboardPeriodCustom,
  isDashboardPeriodEqual,
  normalizeDashboardPeriodDays,
  type DashboardPeriod,
} from "~/lib/career-ops/dashboard-period";
import { useLocale } from "~/lib/i18n/locale-context";
import { cn } from "~/lib/utils";
import type { ApplicationEntry } from "~/lib/career-ops/types";

type DashboardPeriodPickerProps = {
  applications: ApplicationEntry[];
  period: DashboardPeriod;
  onPeriodChange: (period: DashboardPeriod) => void;
};

export function DashboardPeriodPicker({
  applications,
  period,
  onPeriodChange,
}: DashboardPeriodPickerProps) {
  const locale = useLocale();
  const [customOpen, setCustomOpen] = useState(false);
  const [customDaysInput, setCustomDaysInput] = useState(() =>
    period.kind === "days" ? String(period.days) : "7",
  );
  const isCustom = isDashboardPeriodCustom(period);
  const customLabel = isCustom
    ? getDashboardPeriodLabel(period, locale)
    : "Custom";

  useEffect(() => {
    if (period.kind === "days") {
      setCustomDaysInput(String(period.days));
    }
  }, [period]);

  const selectPreset = (nextPeriod: DashboardPeriod) => {
    setCustomOpen(false);
    onPeriodChange(nextPeriod);
  };

  const handleCustomDaysApply = () => {
    const days = normalizeDashboardPeriodDays(Number(customDaysInput));
    setCustomDaysInput(String(days));
    onPeriodChange({ kind: "days", days });
    setCustomOpen(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-white/80">Period</Label>
      <div className="flex flex-wrap gap-1.5">
        {DASHBOARD_PERIOD_PRESETS.map((preset) => (
          <Button
            key={preset.label}
            type="button"
            variant={
              isDashboardPeriodEqual(period, preset.period)
                ? "brand"
                : "brandSecondary"
            }
            size="pillSm"
            onClick={() => selectPreset(preset.period)}
          >
            {preset.label}
          </Button>
        ))}

        <Popover open={customOpen} onOpenChange={setCustomOpen} modal={false}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant={isCustom ? "brand" : "brandSecondary"}
              size="pillSm"
              className={cn("max-w-[11rem] gap-1.5", isCustom && "pr-2 pl-2.5")}
              aria-expanded={customOpen}
            >
              <CalendarIcon className="size-3.5 shrink-0 opacity-80" />
              <span className="truncate">{customLabel}</span>
              <ChevronDownIcon
                className={cn(
                  "size-3.5 shrink-0 opacity-60 transition-transform",
                  customOpen && "rotate-180",
                )}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={8}
            className="w-[min(calc(100vw-2rem),18.5rem)] border-white/10 bg-[#0d0e1f] p-0 shadow-xl shadow-black/40"
          >
            <div className="border-b border-white/8 px-3 py-2.5">
              <p className="text-xs font-medium text-white/70">Custom period</p>
              <div className="mt-2 flex gap-2">
                <Input
                  id="dashboard-period-days"
                  type="number"
                  min={1}
                  max={365}
                  value={customDaysInput}
                  onChange={(event) => setCustomDaysInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleCustomDaysApply();
                    }
                  }}
                  aria-label="Last number of days"
                  className="h-8 border-white/10 bg-[#15162c] text-sm text-white placeholder:text-white/40"
                />
                <Button
                  type="button"
                  variant="brandSecondary"
                  size="pillSm"
                  className="shrink-0"
                  onClick={handleCustomDaysApply}
                >
                  Apply
                </Button>
              </div>
              <p className="mt-1.5 text-[11px] text-white/40">
                Rolling window ending today, or pick a range below.
              </p>
            </div>

            <DashboardPeriodCalendar
              applications={applications}
              period={period}
              onPeriodChange={onPeriodChange}
              onRangeComplete={() => setCustomOpen(false)}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
