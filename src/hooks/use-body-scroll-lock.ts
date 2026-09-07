import { useEffect } from "react";

import { acquireBodyScrollLock } from "~/lib/dom/body-scroll-lock";

export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) {
      return;
    }

    return acquireBodyScrollLock();
  }, [locked]);
}
