"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseAnimatedPresenceOptions = {
  durationMs: number;
};

export function useAnimatedPresence(
  visible: boolean,
  { durationMs }: UseAnimatedPresenceOptions,
) {
  const [isRendered, setIsRendered] = useState(visible);
  const [isClosing, setIsClosing] = useState(false);
  const hasCompletedExitRef = useRef(false);

  const completeExit = useCallback(() => {
    if (hasCompletedExitRef.current) {
      return;
    }

    hasCompletedExitRef.current = true;
    setIsRendered(false);
    setIsClosing(false);
  }, []);

  useEffect(() => {
    if (visible) {
      hasCompletedExitRef.current = false;
      setIsRendered(true);
      setIsClosing(false);
      return;
    }

    if (!isRendered || isClosing) {
      return;
    }

    setIsClosing(true);
  }, [isClosing, isRendered, visible]);

  useEffect(() => {
    if (!isClosing) {
      return;
    }

    const timer = window.setTimeout(completeExit, durationMs);
    return () => {
      window.clearTimeout(timer);
    };
  }, [completeExit, durationMs, isClosing]);

  return {
    isRendered,
    isClosing,
  };
}

/** Keeps exit keyframes applied until unmount to avoid end-of-animation flicker. */
export const animatedExitClassName =
  "fill-mode-forwards motion-reduce:animate-none";
