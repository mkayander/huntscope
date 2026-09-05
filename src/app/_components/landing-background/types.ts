export type LandingBackgroundEffect =
  | "galaxy"
  | "scope"
  | "constellation"
  | "three"
  | "graph-grid";

export type LandingBackgroundOption = {
  value: LandingBackgroundEffect;
  label: string;
  description: string;
};

export const LANDING_BACKGROUND_OPTIONS: LandingBackgroundOption[] = [
  {
    value: "galaxy",
    label: "A · Spiral galaxy",
    description: "Spinning spiral arms with a tilted 3D disk and bright core",
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
  {
    value: "graph-grid",
    label: "G · 3D graph grid",
    description: "Plexus mesh with simplified depth-of-field (sharp center, soft edges)",
  },
];
