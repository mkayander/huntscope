"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

export function useGitHubInstallStatus() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = searchParams.get("github") ?? undefined;
  const pathnameRef = useRef(pathname);

  const clearGitHubInstallStatus = useCallback(() => {
    if (!searchParams.has("github")) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("github");
    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (pathnameRef.current !== pathname) {
      pathnameRef.current = pathname;
      clearGitHubInstallStatus();
    }
  }, [pathname, clearGitHubInstallStatus]);

  return {
    status,
    clearGitHubInstallStatus,
  };
}
