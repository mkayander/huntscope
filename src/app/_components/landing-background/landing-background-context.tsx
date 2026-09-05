"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import {
  LANDING_BACKGROUND_OPTIONS,
  type LandingBackgroundEffect,
  type ScopeOverlayLayer,
} from "~/app/_components/landing-background/types";

type LandingBackgroundContextValue = {
  effect: LandingBackgroundEffect;
  setEffect: (effect: LandingBackgroundEffect) => void;
  scopeOverlayEnabled: boolean;
  setScopeOverlayEnabled: (enabled: boolean) => void;
  scopeOverlayLayer: ScopeOverlayLayer;
  setScopeOverlayLayer: (layer: ScopeOverlayLayer) => void;
};

const LandingBackgroundContext = createContext<LandingBackgroundContextValue | null>(
  null,
);

export function LandingBackgroundProvider({ children }: { children: ReactNode }) {
  const [effect, setEffect] = useState<LandingBackgroundEffect>("scope");
  const [scopeOverlayEnabled, setScopeOverlayEnabled] = useState(true);
  const [scopeOverlayLayer, setScopeOverlayLayer] = useState<ScopeOverlayLayer>("front");

  return (
    <LandingBackgroundContext.Provider
      value={{
        effect,
        setEffect,
        scopeOverlayEnabled,
        setScopeOverlayEnabled,
        scopeOverlayLayer,
        setScopeOverlayLayer,
      }}
    >
      {children}
    </LandingBackgroundContext.Provider>
  );
}

export function useLandingBackground(): LandingBackgroundContextValue {
  const context = useContext(LandingBackgroundContext);
  if (!context) {
    throw new Error("useLandingBackground must be used within LandingBackgroundProvider");
  }

  return context;
}

export function LandingBackgroundPicker() {
  const {
    effect,
    setEffect,
    scopeOverlayEnabled,
    setScopeOverlayEnabled,
    scopeOverlayLayer,
    setScopeOverlayLayer,
  } = useLandingBackground();
  const selectedOption = LANDING_BACKGROUND_OPTIONS.find((option) => option.value === effect);
  const scopeIsPrimary = effect === "scope";

  return (
    <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-white/15 bg-black/35 px-4 py-3 backdrop-blur-md">
      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
          Compare background styles
        </span>
        <select
          value={effect}
          onChange={(event) => {
            setEffect(event.target.value as LandingBackgroundEffect);
          }}
          className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white outline-none ring-violet-400/40 focus:ring-2"
        >
          {LANDING_BACKGROUND_OPTIONS.map((option) => (
            <option key={option.value} value={option.value} className="bg-[#15162c]">
              {option.label}
            </option>
          ))}
        </select>
        {selectedOption ? (
          <span className="text-xs text-white/55">{selectedOption.description}</span>
        ) : null}
      </label>

      <div className="border-t border-white/10 pt-3">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={scopeOverlayEnabled}
            onChange={(event) => {
              setScopeOverlayEnabled(event.target.checked);
            }}
            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/10 accent-violet-500"
          />
          <span className="flex flex-col gap-1">
            <span className="text-sm font-medium text-white/90">Scope radar overlay</span>
            <span className="text-xs text-white/55">
              Keep the Huntscope reticle visible over other background modes.
            </span>
          </span>
        </label>

        {scopeOverlayEnabled && !scopeIsPrimary ? (
          <div className="mt-3 flex flex-col gap-2 pl-7">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
              Overlay layer
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setScopeOverlayLayer("back");
                }}
                className={
                  scopeOverlayLayer === "back"
                    ? "rounded-full bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-violet-300/40"
                    : "rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/75 ring-1 ring-white/15 hover:bg-white/15"
                }
              >
                Behind
              </button>
              <button
                type="button"
                onClick={() => {
                  setScopeOverlayLayer("front");
                }}
                className={
                  scopeOverlayLayer === "front"
                    ? "rounded-full bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-violet-300/40"
                    : "rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/75 ring-1 ring-white/15 hover:bg-white/15"
                }
              >
                On top
              </button>
            </div>
          </div>
        ) : null}

        {scopeOverlayEnabled && scopeIsPrimary ? (
          <p className="mt-2 pl-7 text-xs text-white/45">
            Scope is already the active background.
          </p>
        ) : null}
      </div>
    </div>
  );
}
