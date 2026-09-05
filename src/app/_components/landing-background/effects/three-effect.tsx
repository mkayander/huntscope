"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import {
  depthBlurToStarParticleColor,
  writeParticleDepthColors,
} from "~/app/_components/landing-background/effects/depth-of-field";

const PARTICLE_COUNT = 1800;

function ParticleCloud() {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(PARTICLE_COUNT * 3);

    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      const radius = 2.2 + Math.random() * 2.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta) * 0.82;
      const z = radius * Math.cos(phi) * 0.92;

      values[index * 3] = x;
      values[index * 3 + 1] = y;
      values[index * 3 + 2] = z;
    }

    return values;
  }, []);
  const pointColors = useMemo(
    () => new Float32Array(PARTICLE_COUNT * 3).fill(1),
    [],
  );
  const tempPosition = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera }, delta) => {
    const points = pointsRef.current;
    if (!points) {
      return;
    }

    points.rotation.y += delta * 0.07;
    points.rotation.x += delta * 0.02;

    writeParticleDepthColors({
      positions,
      colors: pointColors,
      count: PARTICLE_COUNT,
      object: points,
      camera,
      temp: tempPosition,
      colorForBlur: depthBlurToStarParticleColor,
    });

    const colorAttr = points.geometry.getAttribute("color") as THREE.BufferAttribute;
    colorAttr.needsUpdate = true;
  });

  return (
    <group scale={[1, 1.28, 1]}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[pointColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          vertexColors
          size={0.062}
          sizeAttenuation
          transparent
          opacity={1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
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
        dpr={[1, 2]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
          toneMapping: THREE.NoToneMapping,
        }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.55} />
        <pointLight position={[4, 4, 4]} intensity={1.45} color="#f5f3ff" />
        <pointLight position={[-3, -2, 2]} intensity={0.65} color="#ddd6fe" />
        <ParticleCloud />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI * 0.62}
          minPolarAngle={Math.PI * 0.3}
        />
      </Canvas>
    </div>
  );
}
