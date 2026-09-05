"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import {
  LANDING_BACKGROUND_OPTIONS,
  type LandingBackgroundEffect,
} from "~/app/_components/landing-background/types";

type LandingBackgroundContextValue = {
  effect: LandingBackgroundEffect;
  setEffect: (effect: LandingBackgroundEffect) => void;
};

const LandingBackgroundContext = createContext<LandingBackgroundContextValue | null>(
  null,
);

export function LandingBackgroundProvider({ children }: { children: ReactNode }) {
  const [effect, setEffect] = useState<LandingBackgroundEffect>("scope");

  return (
    <LandingBackgroundContext.Provider value={{ effect, setEffect }}>
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
  const { effect, setEffect } = useLandingBackground();
  const selectedOption = LANDING_BACKGROUND_OPTIONS.find((option) => option.value === effect);

  return (
    <label className="flex w-full max-w-md flex-col gap-2 rounded-2xl border border-white/15 bg-black/35 px-4 py-3 backdrop-blur-md">
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
  );
}
