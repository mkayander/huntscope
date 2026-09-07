"use client";

import { useDashboardSections } from "~/app/_components/dashboard-section-nav";
import { DASHBOARD_SECTION_IDS } from "~/lib/dashboard/sections";
import { cn } from "~/lib/utils";

export function MobileSectionNav() {
  const { sections, activeSectionId, scrollToSection } = useDashboardSections();

  const navigableSections = sections.filter(
    (section) => section.id !== DASHBOARD_SECTION_IDS.repository,
  );

  if (navigableSections.length < 2) {
    return null;
  }

  return (
    <nav
      aria-label="Dashboard sections"
      className="border-t border-white/10 py-2 xl:hidden"
    >
      <div
        className={cn(
          "flex [scrollbar-width:none] gap-2 overflow-x-auto pb-0.5",
          "[&::-webkit-scrollbar]:hidden",
        )}
      >
        {navigableSections.map((section) => {
          const isActive = section.id === activeSectionId;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:outline-none",
                isActive
                  ? "bg-violet-500/20 text-violet-100 ring-1 ring-violet-400/40"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              {section.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
