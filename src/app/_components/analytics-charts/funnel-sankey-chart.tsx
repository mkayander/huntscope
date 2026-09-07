"use client";

import * as d3 from "d3";
import { sankey, sankeyJustify, sankeyLinkHorizontal } from "d3-sankey";
import { useEffect, useRef } from "react";

import { CHART_COLORS } from "~/app/_components/analytics-charts/chart-theme";
import { useChartSize } from "~/app/_components/analytics-charts/use-chart-size";
import { glassCardSurfaceClassName } from "~/components/ui/glass-surface";
import type { FunnelSankeyData } from "~/lib/career-ops/funnel-sankey";
import { cn } from "~/lib/utils";

type FunnelSankeyChartProps = {
  data: FunnelSankeyData;
};

type SankeyNodeDatum = FunnelSankeyData["nodes"][number] & {
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
  value?: number;
};

type SankeyLinkInput = {
  source: string;
  target: string;
  value: number;
  color: string;
};

type SankeyLinkLayout = SankeyLinkInput & {
  source: SankeyNodeDatum;
  target: SankeyNodeDatum;
  width?: number;
  y0?: number;
  y1?: number;
};

type NodeLabelLayout = {
  x: number;
  y: number;
  textAnchor: "start" | "end" | "middle";
};

const SANKEY_MARGIN = {
  top: 28,
  right: 16,
  bottom: 28,
  left: 16,
} as const;

const LABEL_GUTTER_LEFT = 92;
const LABEL_GUTTER_RIGHT = 108;
const SANKEY_VERTICAL_PADDING = 16;

function getNodeLabelLayout(
  node: SankeyNodeDatum,
  leftColumnX: number,
  rightColumnX: number,
  innerWidth: number,
): NodeLabelLayout {
  const nodeX = node.x0 ?? 0;
  const nodeWidth = (node.x1 ?? 0) - nodeX;
  const nodeY = node.y0 ?? 0;
  const nodeHeight = (node.y1 ?? 0) - nodeY;
  const centerY = nodeY + nodeHeight / 2;

  if (nodeX <= leftColumnX) {
    return {
      x: LABEL_GUTTER_LEFT - 12,
      y: centerY,
      textAnchor: "end",
    };
  }

  if (nodeX >= rightColumnX) {
    return {
      x: innerWidth - LABEL_GUTTER_RIGHT + 24,
      y: centerY,
      textAnchor: "start",
    };
  }

  return {
    x: nodeX + nodeWidth / 2,
    y: Math.max(12, nodeY - 10),
    textAnchor: "middle",
  };
}

export function FunnelSankeyChart({ data }: FunnelSankeyChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const nodeCount = data.nodes.length;
  const chartHeight = Math.min(360, Math.max(220, 72 + nodeCount * 28));
  const { containerRef, width, height } = useChartSize({
    aspectRatio: chartHeight / 640,
    minHeight: chartHeight,
    maxHeight: chartHeight,
  });

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement || data.nodes.length === 0 || data.links.length === 0) {
      return;
    }

    const innerWidth = width - SANKEY_MARGIN.left - SANKEY_MARGIN.right;
    const innerHeight = height - SANKEY_MARGIN.top - SANKEY_MARGIN.bottom;

    const svg = d3
      .select(svgElement)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("role", "img")
      .attr("aria-label", "Job search pipeline funnel sankey chart");

    svg.selectAll("*").remove();

    const root = svg
      .append("g")
      .attr(
        "transform",
        `translate(${SANKEY_MARGIN.left},${SANKEY_MARGIN.top})`,
      );

    const graphInput: {
      nodes: SankeyNodeDatum[];
      links: SankeyLinkInput[];
    } = {
      nodes: data.nodes.map((node) => ({ ...node })),
      links: data.links.map((link) => ({ ...link })),
    };

    const nodePadding = Math.max(
      22,
      Math.min(40, innerHeight / (nodeCount + 1)),
    );

    const graph = sankey<SankeyNodeDatum, SankeyLinkInput>()
      .nodeId((node) => node.id)
      .nodeAlign(sankeyJustify)
      .nodeWidth(12)
      .nodePadding(nodePadding)
      .extent([
        [LABEL_GUTTER_LEFT, SANKEY_VERTICAL_PADDING],
        [
          innerWidth - LABEL_GUTTER_RIGHT,
          innerHeight - SANKEY_VERTICAL_PADDING,
        ],
      ])(graphInput);

    const leftColumnX = d3.min(graph.nodes, (node) => node.x0) ?? 0;
    const rightColumnX = d3.max(graph.nodes, (node) => node.x0) ?? 0;
    const layoutLinks = graph.links as SankeyLinkLayout[];
    const linkPath = sankeyLinkHorizontal<SankeyNodeDatum, SankeyLinkLayout>();

    root
      .append("g")
      .attr("fill", "none")
      .selectAll("path")
      .data(layoutLinks)
      .join("path")
      .attr("d", linkPath)
      .attr("stroke", (link) => link.color)
      .attr("stroke-width", (link) => Math.max(1, link.width ?? 0))
      .attr("stroke-opacity", 0.5)
      .attr("stroke-linecap", "round");

    const nodeGroups = root
      .append("g")
      .selectAll("g")
      .data(graph.nodes)
      .join("g");

    nodeGroups
      .append("rect")
      .attr("x", (node) => node.x0 ?? 0)
      .attr("y", (node) => node.y0 ?? 0)
      .attr("height", (node) => Math.max(1, (node.y1 ?? 0) - (node.y0 ?? 0)))
      .attr("width", (node) => (node.x1 ?? 0) - (node.x0 ?? 0))
      .attr("fill", (node) => node.color)
      .attr("rx", 2);

    nodeGroups.each(function (node) {
      const group = d3.select(this);
      const label = getNodeLabelLayout(
        node,
        leftColumnX,
        rightColumnX,
        innerWidth,
      );
      const isMiddleColumn =
        node.x0 !== undefined &&
        node.x0 > leftColumnX &&
        node.x0 < rightColumnX;

      group
        .append("text")
        .attr("x", label.x)
        .attr("y", label.y)
        .attr("dy", isMiddleColumn ? "-0.1em" : "-0.35em")
        .attr("text-anchor", label.textAnchor)
        .attr("fill", CHART_COLORS.label)
        .attr("font-size", 12)
        .text(node.label);

      group
        .append("text")
        .attr("x", label.x)
        .attr("y", label.y)
        .attr("dy", isMiddleColumn ? "1.05em" : "0.95em")
        .attr("text-anchor", label.textAnchor)
        .attr("fill", "rgba(255,255,255,0.88)")
        .attr("font-size", 13)
        .attr("font-weight", 600)
        .text(String(node.value ?? 0));
    });

    return () => {
      svg.selectAll("*").remove();
    };
  }, [data, height, nodeCount, width]);

  return (
    <div
      className={cn(
        glassCardSurfaceClassName,
        "flex h-full flex-col rounded-xl p-4",
      )}
    >
      <div>
        <h4 className="text-sm font-semibold text-white">Pipeline funnel</h4>
        <p className="mt-1 text-xs text-white/50">
          Scan → evaluation → apply, with flow width showing how many jobs
          reached each stage or outcome.
        </p>
      </div>
      <div ref={containerRef} className="mt-4 min-h-[220px] flex-1">
        <svg ref={svgRef} className="h-auto w-full overflow-visible" />
      </div>
    </div>
  );
}
