"use client";

import { useDashboardSections } from "~/app/_components/dashboard-section-nav";
import { clickablePillClassName } from "~/components/ui/interaction";
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
      className="border-t border-white/10 pb-1.5 xl:hidden"
    >
      <div
        className={cn(
          "flex gap-1.5 overflow-x-auto overflow-y-visible py-1.5",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
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
                clickablePillClassName,
                "shrink-0 rounded-full px-2.5 py-1 text-[11px] leading-tight font-medium",
                isActive
                  ? "bg-violet-500/20 text-violet-100 shadow-[inset_0_0_0_1px_rgba(167,139,250,0.35)]"
                  : "bg-white/5 text-white/70 hover:text-white",
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
