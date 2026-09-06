"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { cn } from "~/lib/utils";

export type DashboardSectionEntry = {
  id: string;
  label: string;
  order: number;
};

type DashboardSectionContextValue = {
  sections: DashboardSectionEntry[];
  registerSection: (section: DashboardSectionEntry) => void;
  unregisterSection: (id: string) => void;
};

const DashboardSectionContext = createContext<DashboardSectionContextValue | null>(null);

export function DashboardSectionProvider({ children }: { children: ReactNode }) {
  const [sections, setSections] = useState<DashboardSectionEntry[]>([]);

  const registerSection = useCallback((section: DashboardSectionEntry) => {
    setSections((current) => {
      const withoutCurrent = current.filter((entry) => entry.id !== section.id);
      return [...withoutCurrent, section].sort((left, right) => left.order - right.order);
    });
  }, []);

  const unregisterSection = useCallback((id: string) => {
    setSections((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      sections,
      registerSection,
      unregisterSection,
    }),
    [registerSection, sections, unregisterSection],
  );

  return (
    <DashboardSectionContext.Provider value={value}>{children}</DashboardSectionContext.Provider>
  );
}

export function useDashboardSections() {
  const context = useContext(DashboardSectionContext);
  if (!context) {
    throw new Error("useDashboardSections must be used within DashboardSectionProvider");
  }

  return context;
}

type DashboardSectionProps = {
  id: string;
  label: string;
  order: number;
  className?: string;
  children: ReactNode;
};

export function DashboardSection({
  id,
  label,
  order,
  className,
  children,
}: DashboardSectionProps) {
  const { registerSection, unregisterSection } = useDashboardSections();

  useEffect(() => {
    registerSection({ id, label, order });
    return () => unregisterSection(id);
  }, [id, label, order, registerSection, unregisterSection]);

  return (
    <section
      id={id}
      data-dashboard-section={id}
      aria-label={label}
      className={cn("scroll-mt-28", className)}
    >
      {children}
    </section>
  );
}
