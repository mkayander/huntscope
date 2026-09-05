"use client";

import { useMemo } from "react";

import { useDashboardSections } from "~/app/_components/dashboard-section-nav";
import { useScrollSpy } from "~/hooks/use-scroll-spy";
import { cn } from "~/lib/utils";

export function PageSectionNav() {
  const { sections } = useDashboardSections();
  const sectionIds = useMemo(() => sections.map((section) => section.id), [sections]);
  const { activeId, scrollToSection } = useScrollSpy({ sectionIds });

  if (sections.length < 2) {
    return null;
  }

  const activeIndex = sections.findIndex((section) => section.id === activeId);
  const progress =
    sections.length <= 1
      ? 0
      : Math.max(0, activeIndex) / Math.max(sections.length - 1, 1);

  return (
    <aside className="sticky top-28 hidden w-3 shrink-0 self-start pt-1 xl:block">
      <nav aria-label="Dashboard sections" className="relative flex flex-col items-center">
        <div
          aria-hidden
          className="absolute top-1 bottom-1 left-1/2 w-px -translate-x-1/2 bg-white/10"
        />
        <div
          aria-hidden
          className="absolute top-1 left-1/2 w-px -translate-x-1/2 origin-top bg-violet-400/70 transition-[height] duration-300 ease-out"
          style={{
            height: `calc((100% - 0.5rem) * ${progress})`,
          }}
        />

        <ol className="relative m-0 flex list-none flex-col gap-2.5 p-0">
          {sections.map((section) => {
            const isActive = section.id === activeId;

            return (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  aria-current={isActive ? "true" : undefined}
                  aria-label={section.label}
                  title={section.label}
                  className="group relative flex size-3 items-center justify-center"
                >
                  <span
                    className={cn(
                      "size-2 rounded-full border transition-[background-color,border-color,box-shadow] duration-200",
                      isActive
                        ? "border-violet-200 bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.75)]"
                        : "border-white/25 bg-white/30 group-hover:border-white/40 group-hover:bg-white/45",
                    )}
                  />
                  <span
                    className={cn(
                      "pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] leading-none transition-opacity duration-200",
                      isActive
                        ? "text-white/90 opacity-100"
                        : "text-white/55 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
                    )}
                  >
                    {section.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </aside>
  );
}
