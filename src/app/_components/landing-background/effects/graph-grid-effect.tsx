"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type PlexusData = {
  pointPositions: Float32Array;
  linePositions: Float32Array;
  pointCount: number;
  lineVertexCount: number;
};

import {
  computeDepthBlur,
  depthBlurToCyanLineColor,
  depthBlurToCyanParticleColor,
  writeParticleDepthColors,
} from "~/app/_components/landing-background/effects/depth-of-field";

const CONNECTION_DISTANCE = 0.78;
const MAX_CONNECTIONS_PER_NODE = 5;

function buildPlexusGrid(): PlexusData {
  const cols = 14;
  const rows = 12;
  const layers = 7;
  const spacing = 0.4;
  const nodes: THREE.Vector3[] = [];

  for (let layer = 0; layer < layers; layer += 1) {
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const nx = (col - (cols - 1) / 2) / cols;
        const ny = (row - (rows - 1) / 2) / rows;
        const nz = (layer - (layers - 1) / 2) / layers;
        const waveX = Math.sin(row * 0.55 + layer * 0.35) * 0.24;
        const waveY = Math.cos(col * 0.42 + layer * 0.28) * 0.2;
        const waveZ = Math.sin(col * 0.25 + row * 0.31) * 0.28;

        nodes.push(
          new THREE.Vector3(
            nx * cols * spacing * 0.78 + waveX,
            ny * rows * spacing * 0.82 + waveY,
            nz * layers * spacing * 0.9 + waveZ,
          ),
        );
      }
    }
  }

  const pointPositions = new Float32Array(nodes.length * 3);
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (!node) {
      continue;
    }

    pointPositions[index * 3] = node.x;
    pointPositions[index * 3 + 1] = node.y;
    pointPositions[index * 3 + 2] = node.z;
  }

  const lineVertices: number[] = [];
  const connectionCounts = new Array<number>(nodes.length).fill(0);

  for (let left = 0; left < nodes.length; left += 1) {
    const nodeA = nodes[left];
    if (!nodeA) {
      continue;
    }

    const nearby = nodes
      .map((nodeB, right) => ({
        right,
        distance: nodeA.distanceTo(nodeB),
      }))
      .filter((entry) => entry.right > left && entry.distance <= CONNECTION_DISTANCE)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, MAX_CONNECTIONS_PER_NODE - (connectionCounts[left] ?? 0));

    for (const candidate of nearby) {
      if ((connectionCounts[left] ?? 0) >= MAX_CONNECTIONS_PER_NODE) {
        break;
      }

      if ((connectionCounts[candidate.right] ?? 0) >= MAX_CONNECTIONS_PER_NODE) {
        continue;
      }

      const nodeB = nodes[candidate.right];
      if (!nodeB) {
        continue;
      }

      lineVertices.push(nodeA.x, nodeA.y, nodeA.z, nodeB.x, nodeB.y, nodeB.z);
      connectionCounts[left] = (connectionCounts[left] ?? 0) + 1;
      connectionCounts[candidate.right] = (connectionCounts[candidate.right] ?? 0) + 1;
    }
  }

  return {
    pointPositions,
    linePositions: new Float32Array(lineVertices),
    pointCount: nodes.length,
    lineVertexCount: lineVertices.length / 3,
  };
}

function PlexusGraphGrid() {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const plexus = useMemo(() => buildPlexusGrid(), []);
  const pointColors = useMemo(
    () => new Float32Array(plexus.pointCount * 3).fill(1),
    [plexus.pointCount],
  );
  const lineColors = useMemo(
    () => new Float32Array(plexus.lineVertexCount * 3),
    [plexus.lineVertexCount],
  );
  const tempPosition = useMemo(() => new THREE.Vector3(), []);
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useFrame(({ camera }, delta) => {
    const group = groupRef.current;
    const points = pointsRef.current;
    const lines = linesRef.current;

    if (!group || !points || !lines) {
      return;
    }

    if (!reducedMotion) {
      group.rotation.y += delta * 0.05;
      group.rotation.x = Math.sin(performance.now() * 0.00008) * 0.06 + 0.08;
    }

    const pointColorAttr = points.geometry.getAttribute("color") as THREE.BufferAttribute;
    const lineColorAttr = lines.geometry.getAttribute("color") as THREE.BufferAttribute;
    const lineArray = lines.geometry.getAttribute("position").array as Float32Array;

    writeParticleDepthColors({
      positions: plexus.pointPositions,
      colors: pointColors,
      count: plexus.pointCount,
      object: group,
      camera,
      temp: tempPosition,
      colorForBlur: depthBlurToCyanParticleColor,
    });

    pointColorAttr.needsUpdate = true;

    for (let vertex = 0; vertex < plexus.lineVertexCount; vertex += 1) {
      tempPosition.fromArray(lineArray, vertex * 3);
      group.localToWorld(tempPosition);
      tempPosition.applyMatrix4(camera.matrixWorldInverse);

      const color = depthBlurToCyanLineColor(computeDepthBlur(tempPosition.z));

      lineColors[vertex * 3] = color.r;
      lineColors[vertex * 3 + 1] = color.g;
      lineColors[vertex * 3 + 2] = color.b;
    }

    lineColorAttr.needsUpdate = true;
  });

  return (
    <group ref={groupRef} scale={[1.08, 1.38, 1.08]}>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[plexus.linePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[lineColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.72}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[plexus.pointPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[pointColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          vertexColors
          size={0.065}
          sizeAttenuation
          transparent
          opacity={0.92}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export function GraphGridEffect() {
  return (
    <div className="absolute inset-0 h-full w-full" aria-hidden>
      <Canvas
        camera={{ position: [0, 0.05, 5.8], fov: 58, near: 0.1, far: 100 }}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.45} />
        <pointLight position={[4, 3, 5]} intensity={1.1} color="#93c5fd" />
        <pointLight position={[-4, -2, 2]} intensity={0.45} color="#c4b5fd" />
        <PlexusGraphGrid />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.22}
          maxPolarAngle={Math.PI * 0.62}
          minPolarAngle={Math.PI * 0.3}
        />
      </Canvas>
    </div>
  );
}
