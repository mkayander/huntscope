"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import {
  computeDepthBlur,
  depthBlurToCyanLineColor,
  depthBlurToCyanParticleColor,
} from "~/app/_components/landing-background/effects/depth-of-field";

type ConstellationEdge = {
  from: number;
  to: number;
  progress: number;
  speed: number;
};

type ConstellationData = {
  pointPositions: Float32Array;
  pointPhases: Float32Array;
  pointCount: number;
  edges: ConstellationEdge[];
  linePositions: Float32Array;
  lineVertexCount: number;
};

const NODE_COUNT = 36;
const MIN_NODE_DISTANCE = 0.72;
const MAX_EDGE_DISTANCE = 1.35;
const MAX_NEIGHBORS = 2;

function createScatteredNodes(count: number): THREE.Vector3[] {
  const nodes: THREE.Vector3[] = [];
  let attempts = 0;
  const attemptLimit = count * 60;

  while (nodes.length < count && attempts < attemptLimit) {
    attempts += 1;

    const candidate = new THREE.Vector3(
      (Math.random() - 0.5) * 5.4,
      (Math.random() - 0.5) * 4.6,
      (Math.random() - 0.5) * 3.4,
    );

    const isFarEnough = nodes.every((node) => node.distanceTo(candidate) >= MIN_NODE_DISTANCE);
    if (isFarEnough) {
      nodes.push(candidate);
    }
  }

  while (nodes.length < count) {
    nodes.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 5.4,
        (Math.random() - 0.5) * 4.6,
        (Math.random() - 0.5) * 3.4,
      ),
    );
  }

  return nodes;
}

function buildConstellation(): ConstellationData {
  const nodes = createScatteredNodes(NODE_COUNT);
  const pointPositions = new Float32Array(nodes.length * 3);
  const pointPhases = new Float32Array(nodes.length);
  const edges: ConstellationEdge[] = [];
  const connectionCounts = new Array<number>(nodes.length).fill(0);

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (!node) {
      continue;
    }

    pointPositions[index * 3] = node.x;
    pointPositions[index * 3 + 1] = node.y;
    pointPositions[index * 3 + 2] = node.z;
    pointPhases[index] = Math.random() * Math.PI * 2;
  }

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (!node) {
      continue;
    }

    const neighbors = nodes
      .map((candidate, candidateIndex) => ({
        index: candidateIndex,
        distance: node.distanceTo(candidate),
      }))
      .filter((entry) => entry.index !== index && entry.distance <= MAX_EDGE_DISTANCE)
      .sort((left, right) => left.distance - right.distance)
      .slice(0, MAX_NEIGHBORS);

    for (const neighbor of neighbors) {
      if ((connectionCounts[index] ?? 0) >= MAX_NEIGHBORS) {
        break;
      }

      if ((connectionCounts[neighbor.index] ?? 0) >= MAX_NEIGHBORS) {
        continue;
      }

      const key = [Math.min(index, neighbor.index), Math.max(index, neighbor.index)].join(":");
      if (edges.some((edge) => [edge.from, edge.to].join(":") === key)) {
        continue;
      }

      edges.push({
        from: index,
        to: neighbor.index,
        progress: Math.random(),
        speed: 0.07 + Math.random() * 0.11,
      });
      connectionCounts[index] = (connectionCounts[index] ?? 0) + 1;
      connectionCounts[neighbor.index] = (connectionCounts[neighbor.index] ?? 0) + 1;
    }
  }

  const lineVertices: number[] = [];
  for (const edge of edges) {
    const from = nodes[edge.from];
    const to = nodes[edge.to];
    if (!from || !to) {
      continue;
    }

    lineVertices.push(from.x, from.y, from.z, to.x, to.y, to.z);
  }

  return {
    pointPositions,
    pointPhases,
    pointCount: nodes.length,
    edges,
    linePositions: new Float32Array(lineVertices),
    lineVertexCount: lineVertices.length / 3,
  };
}

function DataConstellation3D() {
  const groupRef = useRef<THREE.Group>(null);
  const nodesRef = useRef<THREE.Points>(null);
  const flowRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const constellation = useMemo(() => buildConstellation(), []);
  const nodeColors = useMemo(
    () => new Float32Array(constellation.pointCount * 3).fill(1),
    [constellation.pointCount],
  );
  const lineColors = useMemo(
    () => new Float32Array(constellation.lineVertexCount * 3),
    [constellation.lineVertexCount],
  );
  const flowPositions = useMemo(
    () => new Float32Array(constellation.edges.length * 3),
    [constellation.edges.length],
  );
  const tempPosition = useMemo(() => new THREE.Vector3(), []);
  const tempFrom = useMemo(() => new THREE.Vector3(), []);
  const tempTo = useMemo(() => new THREE.Vector3(), []);
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useFrame(({ camera }, delta) => {
    const group = groupRef.current;
    const nodes = nodesRef.current;
    const flow = flowRef.current;
    const lines = linesRef.current;

    if (!group || !nodes || !flow || !lines) {
      return;
    }

    if (!reducedMotion) {
      group.rotation.y += delta * 0.045;
      group.rotation.x = Math.sin(performance.now() * 0.00007) * 0.05 + 0.06;
    }

    for (let index = 0; index < constellation.pointCount; index += 1) {
      if (!reducedMotion) {
        constellation.pointPhases[index] =
          (constellation.pointPhases[index] ?? 0) + delta * 1.1;
      }

      tempPosition.fromArray(constellation.pointPositions, index * 3);
      group.localToWorld(tempPosition);
      tempPosition.applyMatrix4(camera.matrixWorldInverse);

      const color = depthBlurToCyanParticleColor(computeDepthBlur(tempPosition.z));
      const phase = constellation.pointPhases[index] ?? 0;
      const pulse = reducedMotion
        ? 1
        : 0.84 + Math.sin(phase + performance.now() * 0.0012) * 0.16;

      nodeColors[index * 3] = color.r * pulse;
      nodeColors[index * 3 + 1] = color.g * pulse;
      nodeColors[index * 3 + 2] = color.b;
    }

    const nodeColorAttr = nodes.geometry.getAttribute("color") as THREE.BufferAttribute;
    nodeColorAttr.needsUpdate = true;

    const lineColorAttr = lines.geometry.getAttribute("color") as THREE.BufferAttribute;
    const lineArray = lines.geometry.getAttribute("position").array as Float32Array;

    for (let vertex = 0; vertex < constellation.lineVertexCount; vertex += 1) {
      tempPosition.fromArray(lineArray, vertex * 3);
      group.localToWorld(tempPosition);
      tempPosition.applyMatrix4(camera.matrixWorldInverse);

      const color = depthBlurToCyanLineColor(computeDepthBlur(tempPosition.z));

      lineColors[vertex * 3] = color.r * 0.55;
      lineColors[vertex * 3 + 1] = color.g * 0.55;
      lineColors[vertex * 3 + 2] = color.b * 0.55;
    }

    lineColorAttr.needsUpdate = true;

    for (let edgeIndex = 0; edgeIndex < constellation.edges.length; edgeIndex += 1) {
      const edge = constellation.edges[edgeIndex];
      if (!edge) {
        continue;
      }

      if (!reducedMotion) {
        edge.progress = (edge.progress + delta * edge.speed) % 1;
      }

      tempFrom.fromArray(constellation.pointPositions, edge.from * 3);
      tempTo.fromArray(constellation.pointPositions, edge.to * 3);
      tempFrom.lerp(tempTo, edge.progress);

      flowPositions[edgeIndex * 3] = tempFrom.x;
      flowPositions[edgeIndex * 3 + 1] = tempFrom.y;
      flowPositions[edgeIndex * 3 + 2] = tempFrom.z;
    }

    const flowPositionAttr = flow.geometry.getAttribute("position") as THREE.BufferAttribute;
    flowPositionAttr.needsUpdate = true;
  });

  return (
    <group ref={groupRef} scale={[1.05, 1.28, 1.05]}>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[constellation.linePositions, 3]}
          />
          <bufferAttribute attach="attributes-color" args={[lineColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.38}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      <points ref={flowRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[flowPositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#eef2ff"
          size={0.05}
          sizeAttenuation
          transparent
          opacity={0.95}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>

      <points ref={nodesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[constellation.pointPositions, 3]}
          />
          <bufferAttribute attach="attributes-color" args={[nodeColors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          vertexColors
          size={0.072}
          sizeAttenuation
          transparent
          opacity={0.94}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
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
        <DataConstellation3D />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.2}
          maxPolarAngle={Math.PI * 0.62}
          minPolarAngle={Math.PI * 0.3}
        />
      </Canvas>
    </div>
  );
}
