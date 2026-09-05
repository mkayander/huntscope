"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import {
  depthBlurToStarParticleColor,
  STAR_FIELD_DEPTH_OF_FIELD,
  writeParticleDepthColors,
} from "~/app/_components/landing-background/effects/depth-of-field";

const PARTICLE_COUNT = 1100;
const POINTER_SMOOTHING = 0.05;
const AZIMUTH_MOUSE_INFLUENCE = 0.08;
const POLAR_MOUSE_INFLUENCE = 0.035;
const CAMERA_RADIUS = 5.6;
const CAMERA_Y_OFFSET = 0.05;
const BASE_POLAR_ANGLE = Math.acos(CAMERA_Y_OFFSET / CAMERA_RADIUS);
const AUTO_ROTATE_SPEED = 0.11;
const MIN_POLAR_ANGLE = Math.PI * 0.3;
const MAX_POLAR_ANGLE = Math.PI * 0.62;

function CameraRig() {
  const azimuthRef = useRef(0);
  const pointerTargetRef = useRef({ x: 0, y: 0 });
  const pointerCurrentRef = useRef({ x: 0, y: 0 });
  const pointerEnabledRef = useRef(true);
  const offset = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    pointerEnabledRef.current = !reducedMotion;

    if (reducedMotion) {
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      pointerTargetRef.current = {
        x: (event.clientX / window.innerWidth - 0.5) * 2,
        y: (event.clientY / window.innerHeight - 0.5) * 2,
      };
    };

    const onPointerLeave = () => {
      pointerTargetRef.current = { x: 0, y: 0 };
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  useFrame((state, delta) => {
    azimuthRef.current += delta * AUTO_ROTATE_SPEED;

    if (pointerEnabledRef.current) {
      pointerCurrentRef.current = {
        x:
          pointerCurrentRef.current.x +
          (pointerTargetRef.current.x - pointerCurrentRef.current.x) * POINTER_SMOOTHING,
        y:
          pointerCurrentRef.current.y +
          (pointerTargetRef.current.y - pointerCurrentRef.current.y) * POINTER_SMOOTHING,
      };
    } else {
      pointerCurrentRef.current = { x: 0, y: 0 };
    }

    const azimuth =
      azimuthRef.current + pointerCurrentRef.current.x * AZIMUTH_MOUSE_INFLUENCE;
    const polar = THREE.MathUtils.clamp(
      BASE_POLAR_ANGLE - pointerCurrentRef.current.y * POLAR_MOUSE_INFLUENCE,
      MIN_POLAR_ANGLE,
      MAX_POLAR_ANGLE,
    );

    offset.setFromSphericalCoords(CAMERA_RADIUS, polar, azimuth);
    offset.y += CAMERA_Y_OFFSET;

    state.camera.position.copy(offset);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

function createStarTexture() {
  const size = 32;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  context.clearRect(0, 0, size, size);
  context.fillStyle = "#ffffff";
  context.beginPath();
  context.arc(size / 2, size / 2, size * 0.36, 0, Math.PI * 2);
  context.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function ParticleCloud() {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const starTexture = useMemo(() => createStarTexture(), []);
  const positions = useMemo(() => {
    const values = new Float32Array(PARTICLE_COUNT * 3);

    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      const radius = 3.2 + Math.random() * 3.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta) * 0.78;
      const z = radius * Math.cos(phi) * 0.88;

      values[index * 3] = x;
      values[index * 3 + 1] = y;
      values[index * 3 + 2] = z;
    }

    return values;
  }, []);
  const pointColors = useMemo(
    () => new Float32Array(PARTICLE_COUNT * 3),
    [],
  );
  const tempPosition = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera, clock }, delta) => {
    const group = groupRef.current;
    const points = pointsRef.current;
    if (!group || !points) {
      return;
    }

    group.rotation.y += delta * 0.025;
    group.rotation.x = Math.sin(clock.elapsedTime * 0.07) * 0.012 + 0.01;

    writeParticleDepthColors({
      positions,
      colors: pointColors,
      count: PARTICLE_COUNT,
      object: group,
      camera,
      temp: tempPosition,
      settings: STAR_FIELD_DEPTH_OF_FIELD,
      colorForBlur: (blur) => {
        const color = depthBlurToStarParticleColor(blur);
        const focus = 1 - blur;
        const dim = 0.34 + focus * 0.66;

        return {
          r: color.r * dim,
          g: color.g * dim,
          b: color.b * dim,
        };
      },
    });

    const colorAttr = points.geometry.getAttribute("color") as THREE.BufferAttribute;
    colorAttr.needsUpdate = true;
  });

  return (
    <group ref={groupRef} scale={[1, 1.22, 1]}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[pointColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={starTexture ?? undefined}
          alphaMap={starTexture ?? undefined}
          vertexColors
          size={0.042}
          sizeAttenuation
          transparent
          opacity={0.82}
          depthWrite={false}
          blending={THREE.NormalBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
}

export function ThreeEffect() {
  return (
    <div className="absolute inset-0 h-full w-full" aria-hidden>
      <Canvas
        camera={{ position: [0, 0.05, 5.6], fov: 58, near: 0.1, far: 100 }}
        dpr={[1, 1.75]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.NoToneMapping,
        }}
        style={{ background: "transparent" }}
      >
        <ParticleCloud />
        <CameraRig />
      </Canvas>
    </div>
  );
}
