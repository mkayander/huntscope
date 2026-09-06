"use client";

import { useEffect } from "react";

export type PageShellTheme = "landing" | "dashboard";

export function usePageShellTheme(theme: PageShellTheme) {
  useEffect(() => {
    document.documentElement.dataset.pageShell = theme;

    return () => {
      delete document.documentElement.dataset.pageShell;
    };
  }, [theme]);
}
