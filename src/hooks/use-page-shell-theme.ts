"use client";

import { useLayoutEffect } from "react";

import { PAGE_SHELL_LANDING_BACKGROUND } from "~/lib/page-shell-background";

export type PageShellTheme = "landing" | "dashboard";

export function usePageShellTheme(theme: PageShellTheme) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.pageShell = theme;

    if (theme === "landing") {
      root.style.setProperty(
        "--page-shell-background",
        PAGE_SHELL_LANDING_BACKGROUND,
      );
    } else {
      root.style.removeProperty("--page-shell-background");
    }

    return () => {
      delete root.dataset.pageShell;
      root.style.removeProperty("--page-shell-background");
    };
  }, [theme]);
}
