export type LandingBackgroundEffect = "galaxy" | "scope" | "constellation" | "three";

export type LandingBackgroundOption = {
  value: LandingBackgroundEffect;
  label: string;
  description: string;
};

export const LANDING_BACKGROUND_OPTIONS: LandingBackgroundOption[] = [
  {
    value: "galaxy",
    label: "A · Galaxy starfield",
    description: "Astra-style dense star drift with depth parallax",
  },
  {
    value: "scope",
    label: "C · Scope / radar",
    description: "Concentric rings, sweep line, and pulsing blips",
  },
  {
    value: "constellation",
    label: "D · Data constellation",
    description: "Connected nodes with particles flowing on edges",
  },
  {
    value: "three",
    label: "F · 3D particle field",
    description: "WebGL point cloud with slow orbit motion",
  },
];
