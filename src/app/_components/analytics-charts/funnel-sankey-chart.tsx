"use client";

import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import { useEffect, useRef } from "react";

import {
  CHART_COLORS,
  CHART_MARGIN,
} from "~/app/_components/analytics-charts/chart-theme";
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

const SANKEY_MARGIN = {
  top: CHART_MARGIN.top,
  right: 120,
  bottom: CHART_MARGIN.bottom,
  left: 12,
} as const;

export function FunnelSankeyChart({ data }: FunnelSankeyChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, width, height } = useChartSize({
    aspectRatio: 0.45,
    minHeight: 260,
    maxHeight: 420,
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
      .attr("aria-label", "Application funnel sankey chart");

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

    const graph = sankey<SankeyNodeDatum, SankeyLinkInput>()
      .nodeId((node) => node.id)
      .nodeWidth(14)
      .nodePadding(18)
      .extent([
        [0, 0],
        [innerWidth, innerHeight],
      ])(graphInput);

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
      .attr("stroke-opacity", 0.55)
      .attr("stroke-linecap", "butt");

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

    nodeGroups
      .append("text")
      .attr("x", (node) => {
        const nodeX = node.x0 ?? 0;
        const nodeWidth = (node.x1 ?? 0) - nodeX;
        return nodeX < innerWidth / 2 ? nodeX - 8 : nodeX + nodeWidth + 8;
      })
      .attr("y", (node) => {
        const nodeY = node.y0 ?? 0;
        const nodeHeight = (node.y1 ?? 0) - nodeY;
        return nodeY + nodeHeight / 2;
      })
      .attr("dy", "-0.15em")
      .attr("text-anchor", (node) => {
        const nodeX = node.x0 ?? 0;
        return nodeX < innerWidth / 2 ? "end" : "start";
      })
      .attr("fill", CHART_COLORS.label)
      .attr("font-size", 11)
      .text((node) => node.label);

    nodeGroups
      .append("text")
      .attr("x", (node) => {
        const nodeX = node.x0 ?? 0;
        const nodeWidth = (node.x1 ?? 0) - nodeX;
        return nodeX < innerWidth / 2 ? nodeX - 8 : nodeX + nodeWidth + 8;
      })
      .attr("y", (node) => {
        const nodeY = node.y0 ?? 0;
        const nodeHeight = (node.y1 ?? 0) - nodeY;
        return nodeY + nodeHeight / 2;
      })
      .attr("dy", "1.05em")
      .attr("text-anchor", (node) => {
        const nodeX = node.x0 ?? 0;
        return nodeX < innerWidth / 2 ? "end" : "start";
      })
      .attr("fill", "rgba(255,255,255,0.82)")
      .attr("font-size", 12)
      .attr("font-weight", 600)
      .text((node) => String(node.value ?? 0));

    return () => {
      svg.selectAll("*").remove();
    };
  }, [data, height, width]);

  return (
    <div className={cn(glassCardSurfaceClassName, "rounded-xl p-4")}>
      <div>
        <h4 className="text-sm font-semibold text-white">Pipeline funnel</h4>
        <p className="mt-1 text-xs text-white/55">
          Flow width reflects how many applications reached each stage or
          outcome.
        </p>
      </div>
      <div ref={containerRef} className="mt-4">
        <svg ref={svgRef} className="h-auto w-full overflow-visible" />
      </div>
    </div>
  );
}
