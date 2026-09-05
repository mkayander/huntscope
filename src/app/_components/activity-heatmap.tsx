"use client";

import { useState } from "react";

import { ErrorAlert } from "~/app/_components/error-alert";
import { Button } from "~/components/ui/button";
import { GlowPanel } from "~/components/ui/glow-panel";
import { DASHBOARD_SECTION_IDS } from "~/lib/dashboard/sections";
import {
  type ActivityHeatmapPeriod,
  type ActivityLevel,
} from "~/lib/career-ops/activity-heatmap";
import { useActivityHeatmap } from "~/lib/career-ops/use-activity-heatmap";
import type { ApplicationEntry } from "~/lib/career-ops/types";
import { formatDisplayDate, getWeekdayLabels } from "~/lib/i18n/date-format";
import { useLocale } from "~/lib/i18n/locale-context";

const PERIOD_OPTIONS: { value: ActivityHeatmapPeriod; label: string }[] = [
  { value: 12, label: "12 weeks" },
  { value: 26, label: "6 months" },
  { value: 52, label: "1 year" },
];

const LEVEL_CLASS_NAMES: Record<ActivityLevel, string> = {
  0: "bg-white/8 ring-1 ring-white/5",
  1: "bg-violet-900/70 ring-1 ring-violet-800/40",
  2: "bg-violet-700/75 ring-1 ring-violet-600/40",
  3: "bg-violet-500/85 ring-1 ring-violet-400/40",
  4: "bg-violet-300 ring-1 ring-violet-200/50",
};

type ActivityHeatmapProps = {
  applications: ApplicationEntry[];
};

export function ActivityHeatmapPanel({ applications }: ActivityHeatmapProps) {
  const locale = useLocale();
  const dayLabels = getWeekdayLabels(locale);
  const [periodWeeks, setPeriodWeeks] = useState<ActivityHeatmapPeriod>(52);
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    count: number;
  } | null>(null);
  const { heatmap, isLoading, error } = useActivityHeatmap(applications, periodWeeks);

  const summaryLabel =
    hoveredDay != null
      ? hoveredDay.count === 0
        ? `No activity on ${formatDisplayDate(hoveredDay.date, locale)}`
        : `${hoveredDay.count} evaluation${hoveredDay.count === 1 ? "" : "s"} on ${formatDisplayDate(hoveredDay.date, locale)}`
      : heatmap
        ? `${heatmap.totalActivities} evaluation${heatmap.totalActivities === 1 ? "" : "s"} in the last ${periodLabel(periodWeeks)}`
        : isLoading
          ? "Building activity heat map…"
          : "No activity data available";

  return (
    <GlowPanel accent={DASHBOARD_SECTION_IDS.activity}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Search activity</h3>
          <p className="mt-1 text-sm text-white/60">
            GitHub-style heat map of evaluations added to your tracker over time.
            Computed locally in a background worker.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {PERIOD_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={periodWeeks === option.value ? "brand" : "brandSecondary"}
              size="pillSm"
              onClick={() => setPeriodWeeks(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="mt-4">
          <ErrorAlert title="Could not build activity heat map" message={error} />
        </div>
      ) : null}

      <p className="mt-4 text-sm text-white/80">{summaryLabel}</p>

      <div className="mt-4 overflow-x-auto">
        {heatmap ? (
          <div className="inline-flex min-w-full flex-col gap-2">
            <div className="relative ml-8 h-4">
              {heatmap.monthLabels.map((month) => (
                <span
                  key={`${month.label}-${month.weekIndex}`}
                  className="absolute text-xs text-white/45"
                  style={{ left: `${month.weekIndex * 16}px` }}
                >
                  {month.label}
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <div className="flex flex-col gap-1 pt-0.5 text-[10px] leading-none text-white/40">
                {dayLabels.map((label, index) => (
                  <span
                    key={label}
                    className="flex h-3 items-center"
                    aria-hidden={index % 2 === 1}
                  >
                    {index % 2 === 0 ? label : ""}
                  </span>
                ))}
              </div>

              <div className="flex gap-1">
                {heatmap.weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((day, dayIndex) => {
                      if (!day) {
                        return (
                          <span
                            key={`empty-${weekIndex}-${dayIndex}`}
                            className="h-3 w-3 rounded-[3px] bg-transparent"
                            aria-hidden
                          />
                        );
                      }

                      return (
                        <button
                          key={day.date}
                          type="button"
                          aria-label={`${day.count} evaluation${day.count === 1 ? "" : "s"} on ${formatDisplayDate(day.date, locale)}`}
                          className={`h-3 w-3 cursor-pointer rounded-[3px] transition hover:ring-2 hover:ring-white/40 ${LEVEL_CLASS_NAMES[day.level]}`}
                          onMouseEnter={() =>
                            setHoveredDay({ date: day.date, count: day.count })
                          }
                          onMouseLeave={() => setHoveredDay(null)}
                          onFocus={() =>
                            setHoveredDay({ date: day.date, count: day.count })
                          }
                          onBlur={() => setHoveredDay(null)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/60">
            {isLoading ? "Loading heat map…" : "No heat map data to display."}
          </p>
        )}
      </div>

      {heatmap ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
          <span>
            {heatmap.activeDays} active day{heatmap.activeDays === 1 ? "" : "s"} ·{" "}
            {heatmap.datedApplications} dated row
            {heatmap.datedApplications === 1 ? "" : "s"}
            {heatmap.undatedApplications > 0
              ? ` · ${heatmap.undatedApplications} without a parseable date`
              : ""}
          </span>

          <div className="flex items-center gap-2">
            <span>Less</span>
            {([0, 1, 2, 3, 4] as ActivityLevel[]).map((level) => (
              <span
                key={level}
                className={`h-3 w-3 rounded-[3px] ${LEVEL_CLASS_NAMES[level]}`}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      ) : null}
    </GlowPanel>
  );
}

function periodLabel(periodWeeks: ActivityHeatmapPeriod): string {
  if (periodWeeks === 12) {
    return "12 weeks";
  }

  if (periodWeeks === 26) {
    return "6 months";
  }

  return "year";
}
