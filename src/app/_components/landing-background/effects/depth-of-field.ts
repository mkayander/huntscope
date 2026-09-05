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

export const STAR_FIELD_DEPTH_OF_FIELD: DepthOfFieldSettings = {
  focalViewZ: -5.4,
  spread: 2.1,
  edge: 0.05,
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

export function depthBlurToStarParticleColor(blur: number): {
  r: number;
  g: number;
  b: number;
} {
  const focus = 1 - blur;

  return {
    r: 0.55 + focus * 0.45,
    g: 0.62 + focus * 0.38,
    b: 0.88 + focus * 0.12,
  };
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
  settings?: DepthOfFieldSettings;
}): void {
  for (let index = 0; index < input.count; index += 1) {
    input.temp.fromArray(input.positions, index * 3);
    input.object.localToWorld(input.temp);
    input.temp.applyMatrix4(input.camera.matrixWorldInverse);

    const blur = computeDepthBlur(input.temp.z, input.settings);
    const color = input.colorForBlur(blur);

    input.colors[index * 3] = color.r;
    input.colors[index * 3 + 1] = color.g;
    input.colors[index * 3 + 2] = color.b;
  }
}

export function writeStarParticleDepthAttributes(input: {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  blurs: Float32Array;
  count: number;
  object: THREE.Object3D;
  camera: THREE.Camera;
  temp: THREE.Vector3;
  settings?: DepthOfFieldSettings;
}): void {
  const settings = input.settings ?? STAR_FIELD_DEPTH_OF_FIELD;

  for (let index = 0; index < input.count; index += 1) {
    input.temp.fromArray(input.positions, index * 3);
    input.object.localToWorld(input.temp);
    input.temp.applyMatrix4(input.camera.matrixWorldInverse);

    const blur = computeDepthBlur(input.temp.z, settings);
    const color = depthBlurToStarParticleColor(blur);

    input.blurs[index] = blur;
    input.sizes[index] = 2.8 + blur * 12;
    input.colors[index * 3] = color.r;
    input.colors[index * 3 + 1] = color.g;
    input.colors[index * 3 + 2] = color.b;
  }
}

export const starParticleVertexShader = /* glsl */ `
  attribute float blur;
  attribute float size;

  varying float vBlur;
  varying vec3 vColor;

  void main() {
    vBlur = blur;
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / max(-mvPosition.z, 0.1));
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const starParticleFragmentShader = /* glsl */ `
  varying float vBlur;
  varying vec3 vColor;

  void main() {
    vec2 centered = gl_PointCoord - vec2(0.5);
    float dist = length(centered);
    if (dist > 0.5) {
      discard;
    }

    float focus = 1.0 - vBlur;
    float core = 1.0 - smoothstep(0.0, 0.16, dist);
    float halo = 1.0 - smoothstep(0.04, 0.5, dist);

    vec3 sharp = vec3(1.0, 0.98, 0.96);
    vec3 soft = vec3(0.45, 0.58, 0.96);
    vec3 rgb = mix(soft, vColor * sharp, focus);

    float alpha = mix(0.08, 0.98, focus) * halo + core * focus * 0.45;
    gl_FragColor = vec4(rgb, alpha);
  }
`;
