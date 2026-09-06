"use client";

import { useEffect, useState } from "react";

import { Button } from "~/components/ui/button";
import { isInstalledPwa } from "~/lib/pwa/environment";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPwaButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setInstalled(isInstalledPwa());

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (installed) {
    return (
      <p className="text-sm text-emerald-200">
        Installed as an app. Folder permissions persist longer in this mode.
      </p>
    );
  }

  if (!deferredPrompt) {
    return (
      <p className="text-sm text-white/60">
        Install Huntscope from your browser menu for stronger local folder
        access and offline shell caching.
      </p>
    );
  }

  return (
    <Button
      type="button"
      variant="brandSecondary"
      size="pill"
      onClick={() => {
        void (async () => {
          await deferredPrompt.prompt();
          const choice = await deferredPrompt.userChoice;

          if (choice.outcome === "accepted") {
            setInstalled(true);
          }

          setDeferredPrompt(null);
        })();
      }}
    >
      Install app
    </Button>
  );
}
