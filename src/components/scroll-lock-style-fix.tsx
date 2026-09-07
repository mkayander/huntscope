"use client";

import { useEffect } from "react";

import {
  applyScrollLockBodyStyles,
  clearScrollLockBodyStyles,
  ensureScrollLockFixStyle,
} from "~/lib/dom/scroll-lock-style-fix";

export function ScrollLockStyleFix() {
  useEffect(() => {
    ensureScrollLockFixStyle();

    const syncScrollLockStyles = () => {
      ensureScrollLockFixStyle();

      if (document.body.hasAttribute("data-scroll-locked")) {
        applyScrollLockBodyStyles();
        return;
      }

      clearScrollLockBodyStyles();
    };

    syncScrollLockStyles();

    const observer = new MutationObserver(() => {
      syncScrollLockStyles();
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-scroll-locked", "style"],
    });

    return () => {
      observer.disconnect();
      clearScrollLockBodyStyles();
    };
  }, []);

  return null;
}
