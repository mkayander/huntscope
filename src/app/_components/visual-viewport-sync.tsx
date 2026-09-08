"use client";

import { useLayoutEffect } from "react";

import { bindVisualViewportHeight } from "~/lib/dom/visual-viewport-height";

export function VisualViewportSync() {
  useLayoutEffect(() => bindVisualViewportHeight(), []);

  return null;
}
