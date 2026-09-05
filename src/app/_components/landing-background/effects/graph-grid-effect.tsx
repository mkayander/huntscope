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

const FOCAL_VIEW_Z = -3.2;
const DOF_SPREAD = 2.6;
const CONNECTION_DISTANCE = 0.82;
const MAX_CONNECTIONS_PER_NODE = 5;

function computeDepthBlur(viewZ: number): number {
  return THREE.MathUtils.smoothstep(Math.abs(viewZ - FOCAL_VIEW_Z), 0.15, DOF_SPREAD);
}

function buildPlexusGrid(): PlexusData {
  const cols = 15;
  const rows = 10;
  const layers = 6;
  const spacing = 0.42;
  const nodes: THREE.Vector3[] = [];

  for (let layer = 0; layer < layers; layer += 1) {
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const nx = (col - (cols - 1) / 2) / cols;
        const ny = (row - (rows - 1) / 2) / rows;
        const nz = (layer - (layers - 1) / 2) / layers;
        const waveX = Math.sin(row * 0.55 + layer * 0.35) * 0.28;
        const waveY = Math.cos(col * 0.42 + layer * 0.28) * 0.22;
        const waveZ = Math.sin(col * 0.25 + row * 0.31) * 0.35;

        nodes.push(
          new THREE.Vector3(
            nx * cols * spacing * 0.72 + waveX,
            ny * rows * spacing * 0.62 + waveY,
            nz * layers * spacing * 0.95 + waveZ,
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

const pointVertexShader = /* glsl */ `
  attribute float blur;
  attribute float size;

  varying float vBlur;

  void main() {
    vBlur = blur;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (1.0 + blur * 5.5) * (260.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const pointFragmentShader = /* glsl */ `
  varying float vBlur;

  void main() {
    vec2 centered = gl_PointCoord - vec2(0.5);
    float dist = length(centered);
    if (dist > 0.5) {
      discard;
    }

    float core = 1.0 - smoothstep(0.0, 0.22, dist);
    float halo = 1.0 - smoothstep(0.08, 0.5, dist);
    float focus = 1.0 - vBlur;

    vec3 sharpColor = vec3(0.95, 0.97, 1.0);
    vec3 blurColor = vec3(0.42, 0.72, 1.0);
    vec3 color = mix(blurColor, sharpColor, focus);

    float alpha = mix(0.06, 0.95, focus) * mix(halo * 0.55, 1.0, focus) + core * focus * 0.35;
    gl_FragColor = vec4(color, alpha);
  }
`;

function PlexusGraphGrid() {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const plexus = useMemo(() => buildPlexusGrid(), []);
  const blurAttribute = useMemo(() => new Float32Array(plexus.pointCount), [plexus.pointCount]);
  const sizeAttribute = useMemo(
    () => new Float32Array(plexus.pointCount).fill(3.2),
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
      group.rotation.y += delta * 0.07;
      group.rotation.x = Math.sin(performance.now() * 0.00008) * 0.08 + 0.12;
    }

    const pointGeometry = points.geometry;
    const blurAttr = pointGeometry.getAttribute("blur") as THREE.BufferAttribute;
    const sizeAttr = pointGeometry.getAttribute("size") as THREE.BufferAttribute;

    for (let index = 0; index < plexus.pointCount; index += 1) {
      tempPosition.fromArray(plexus.pointPositions, index * 3);
      group.localToWorld(tempPosition);
      tempPosition.applyMatrix4(camera.matrixWorldInverse);

      const blur = computeDepthBlur(tempPosition.z);
      blurAttribute[index] = blur;
      sizeAttribute[index] = 2.4 + blur * 2.8;
    }

    blurAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;

    const lineGeometry = lines.geometry;
    const colorAttr = lineGeometry.getAttribute("color") as THREE.BufferAttribute;
    const lineArray = lineGeometry.getAttribute("position").array as Float32Array;

    for (let vertex = 0; vertex < plexus.lineVertexCount; vertex += 1) {
      tempPosition.fromArray(lineArray, vertex * 3);
      group.localToWorld(tempPosition);
      tempPosition.applyMatrix4(camera.matrixWorldInverse);

      const blur = computeDepthBlur(tempPosition.z);
      const focus = 1 - blur;
      const cyan = 0.38 + focus * 0.55;
      const violet = 0.52 + focus * 0.2;
      const blue = 0.95;

      lineColors[vertex * 3] = cyan * focus + 0.2 * blur;
      lineColors[vertex * 3 + 1] = violet * focus + 0.35 * blur;
      lineColors[vertex * 3 + 2] = blue;
    }

    colorAttr.needsUpdate = true;
  });

  return (
    <group ref={groupRef} position={[0, -0.15, 0]}>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[plexus.linePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[lineColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[plexus.pointPositions, 3]} />
          <bufferAttribute attach="attributes-blur" args={[blurAttribute, 1]} />
          <bufferAttribute attach="attributes-size" args={[sizeAttribute, 1]} />
        </bufferGeometry>
        <shaderMaterial
          vertexShader={pointVertexShader}
          fragmentShader={pointFragmentShader}
          transparent
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
        camera={{ position: [0, 0.2, 8.5], fov: 48 }}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <color attach="background" args={["#00000000"]} />
        <fog attach="fog" args={["#0b1028", 7.5, 16]} />
        <ambientLight intensity={0.25} />
        <pointLight position={[3, 2, 4]} intensity={0.8} color="#93c5fd" />
        <PlexusGraphGrid />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.28}
          maxPolarAngle={Math.PI * 0.58}
          minPolarAngle={Math.PI * 0.34}
        />
      </Canvas>
    </div>
  );
}
