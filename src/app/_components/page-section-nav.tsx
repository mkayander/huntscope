"use client";

import { useMemo } from "react";

import { useDashboardSections } from "~/app/_components/dashboard-section-nav";
import { useScrollSpy } from "~/hooks/use-scroll-spy";
import { cn } from "~/lib/utils";

const TRACK_WIDTH_CLASS = "w-3";
const NAV_WIDTH_CLASS = "w-28";

export function PageSectionNav() {
  const { sections } = useDashboardSections();
  const sectionIds = useMemo(
    () => sections.map((section) => section.id),
    [sections],
  );
  const { activeId, scrollToSection } = useScrollSpy({ sectionIds });
  const showNav = sections.length >= 2;

  const activeIndex = sections.findIndex((section) => section.id === activeId);
  const progress =
    sections.length <= 1
      ? 0
      : Math.max(0, activeIndex) / Math.max(sections.length - 1, 1);

  return (
    <aside
      aria-hidden={!showNav}
      className={cn(
        "sticky top-28 hidden shrink-0 self-start pt-1 xl:block",
        NAV_WIDTH_CLASS,
      )}
    >
      {showNav ? (
        <nav aria-label="Dashboard sections" className="relative">
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-y-0 right-0",
              TRACK_WIDTH_CLASS,
            )}
          >
            <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/10" />
            <div
              className="absolute top-0 left-1/2 w-px origin-top -translate-x-1/2 bg-violet-400/70 transition-[height] duration-300 ease-out"
              style={{
                height: `${progress * 100}%`,
              }}
            />
          </div>

          <ol className="relative m-0 flex list-none flex-col p-0">
            {sections.map((section, index) => {
              const isActive = section.id === activeId;
              const isCompleted = activeIndex >= 0 && index < activeIndex;

              return (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => scrollToSection(section.id)}
                    aria-current={isActive ? "true" : undefined}
                    aria-label={section.label}
                    title={section.label}
                    className="group flex w-full cursor-pointer items-center justify-end gap-2 rounded-md py-2 pr-0 text-right transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:outline-none"
                  >
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate text-[10px] leading-none transition-[color,opacity] duration-200",
                        isActive
                          ? "font-medium text-white/90 opacity-100"
                          : "text-white/55 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
                        isCompleted && "group-hover:text-violet-200/75",
                      )}
                    >
                      {section.label}
                    </span>

                    <span
                      className={cn(
                        "relative z-10 flex size-3 shrink-0 items-center justify-center",
                      )}
                    >
                      <span
                        className={cn(
                          "size-2 rounded-full border transition-[background-color,border-color,box-shadow] duration-200",
                          isActive
                            ? "border-violet-200 bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.75)]"
                            : isCompleted
                              ? "border-violet-300/70 bg-violet-400/50 shadow-[0_0_6px_rgba(167,139,250,0.35)]"
                              : "border-white/25 bg-white/30 group-hover:border-white/40 group-hover:bg-white/45",
                        )}
                      />
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      ) : null}
    </aside>
  );
}
