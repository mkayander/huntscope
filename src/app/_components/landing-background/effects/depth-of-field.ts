import * as THREE from "three";

export type DepthOfFieldSettings = {
  focalViewZ: number;
  spread: number;
  edge: number;
};

export const DEFAULT_DEPTH_OF_FIELD: DepthOfFieldSettings = {
  focalViewZ: -4.5,
  spread: 3.2,
  edge: 0.1,
};

export function computeDepthBlur(
  viewZ: number,
  settings: DepthOfFieldSettings = DEFAULT_DEPTH_OF_FIELD,
): number {
  return THREE.MathUtils.smoothstep(
    Math.abs(viewZ - settings.focalViewZ),
    settings.edge,
    settings.spread,
  );
}

export function depthBlurToVioletParticleColor(blur: number): {
  r: number;
  g: number;
  b: number;
} {
  const focus = 1 - blur;

  return {
    r: 0.68 + focus * 0.3,
    g: 0.62 + focus * 0.35,
    b: 0.92 + focus * 0.08,
  };
}

export function depthBlurToCyanParticleColor(blur: number): {
  r: number;
  g: number;
  b: number;
} {
  const focus = 1 - blur;

  return {
    r: 0.35 + focus * 0.6,
    g: 0.55 + focus * 0.42,
    b: 0.95,
  };
}

export function depthBlurToCyanLineColor(blur: number): {
  r: number;
  g: number;
  b: number;
} {
  const focus = 1 - blur;

  return {
    r: 0.28 + focus * 0.55,
    g: 0.45 + focus * 0.4,
    b: 0.95,
  };
}

export function writeParticleDepthColors(input: {
  positions: Float32Array;
  colors: Float32Array;
  count: number;
  object: THREE.Object3D;
  camera: THREE.Camera;
  temp: THREE.Vector3;
  colorForBlur: (blur: number) => { r: number; g: number; b: number };
}): void {
  for (let index = 0; index < input.count; index += 1) {
    input.temp.fromArray(input.positions, index * 3);
    input.object.localToWorld(input.temp);
    input.temp.applyMatrix4(input.camera.matrixWorldInverse);

    const blur = computeDepthBlur(input.temp.z);
    const color = input.colorForBlur(blur);

    input.colors[index * 3] = color.r;
    input.colors[index * 3 + 1] = color.g;
    input.colors[index * 3 + 2] = color.b;
  }
}
