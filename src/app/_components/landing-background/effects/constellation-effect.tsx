"use client";

import { useMemo } from "react";

import { clearCanvas, useCanvasAnimation } from "~/app/_components/landing-background/canvas-utils";

type Node = {
  x: number;
  y: number;
  pulse: number;
};

type Edge = {
  from: number;
  to: number;
  progress: number;
  speed: number;
};

function createGraph(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = Array.from({ length: 22 }, () => ({
    x: 0.08 + Math.random() * 0.84,
    y: 0.12 + Math.random() * 0.72,
    pulse: Math.random() * Math.PI * 2,
  }));

  const edges: Edge[] = [];

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (!node) {
      continue;
    }

    const neighbors = nodes
      .map((candidate, candidateIndex) => ({
        index: candidateIndex,
        distance: Math.hypot(candidate.x - node.x, candidate.y - node.y),
      }))
      .filter((entry) => entry.index !== index)
      .sort((left, right) => left.distance - right.distance)
      .slice(0, 2);

    for (const neighbor of neighbors) {
      if (neighbor.distance > 0.28) {
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
        speed: 0.08 + Math.random() * 0.12,
      });
    }
  }

  return { nodes, edges };
}

export function ConstellationEffect() {
  const graph = useMemo(() => createGraph(), []);
  const canvasRef = useCanvasAnimation(
    (frame, time, delta) => {
      clearCanvas(frame);

      const { ctx, width, height, reducedMotion } = frame;

      for (const edge of graph.edges) {
        const from = graph.nodes[edge.from];
        const to = graph.nodes[edge.to];
        if (!from || !to) {
          continue;
        }

        const x1 = from.x * width;
        const y1 = from.y * height;
        const x2 = to.x * width;
        const y2 = to.y * height;

        ctx.beginPath();
        ctx.strokeStyle = "rgba(167, 139, 250, 0.16)";
        ctx.lineWidth = 1;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        if (!reducedMotion) {
          edge.progress = (edge.progress + delta * edge.speed) % 1;
        }

        const px = x1 + (x2 - x1) * edge.progress;
        const py = y1 + (y2 - y1) * edge.progress;

        ctx.beginPath();
        ctx.fillStyle = "rgba(221, 214, 254, 0.85)";
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const node of graph.nodes) {
        if (!reducedMotion) {
          node.pulse += delta * 1.2;
        }

        const x = node.x * width;
        const y = node.y * height;
        const glow = 0.45 + Math.sin(node.pulse + time * 0.0015) * 0.2;

        ctx.beginPath();
        ctx.fillStyle = `rgba(196, 181, 253, ${0.35 + glow * 0.45})`;
        ctx.arc(x, y, 3.5 + glow * 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.arc(x, y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    { deps: [graph] },
  );

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />;
}
