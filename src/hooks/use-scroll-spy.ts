"use client";

import { useCallback, useEffect, useState } from "react";

import { DASHBOARD_SECTION_SCROLL_OFFSET } from "~/lib/dashboard/sections";

type UseScrollSpyOptions = {
  sectionIds: string[];
  offset?: number;
};

export function useScrollSpy({
  sectionIds,
  offset = DASHBOARD_SECTION_SCROLL_OFFSET,
}: UseScrollSpyOptions) {
  const [activeId, setActiveId] = useState<string | null>(sectionIds[0] ?? null);

  useEffect(() => {
    if (sectionIds.length === 0) {
      setActiveId(null);
      return;
    }

    const resolveActiveSection = () => {
      const marker = window.scrollY + offset;
      let currentId = sectionIds[0] ?? null;

      for (const sectionId of sectionIds) {
        const element = document.getElementById(sectionId);
        if (!element) {
          continue;
        }

        if (element.offsetTop <= marker) {
          currentId = sectionId;
        }
      }

      setActiveId(currentId);
    };

    resolveActiveSection();

    const observer = new IntersectionObserver(
      () => {
        resolveActiveSection();
      },
      {
        root: null,
        rootMargin: `-${offset}px 0px -55% 0px`,
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      },
    );

    for (const sectionId of sectionIds) {
      const element = document.getElementById(sectionId);
      if (element) {
        observer.observe(element);
      }
    }

    window.addEventListener("scroll", resolveActiveSection, { passive: true });
    window.addEventListener("resize", resolveActiveSection);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", resolveActiveSection);
      window.removeEventListener("resize", resolveActiveSection);
    };
  }, [offset, sectionIds]);

  const scrollToSection = useCallback(
    (sectionId: string) => {
      const element = document.getElementById(sectionId);
      if (!element) {
        return;
      }

      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveId(sectionId);
    },
    [offset],
  );

  return {
    activeId,
    scrollToSection,
  };
}
