"use client";

import * as d3 from "d3";
import { useEffect, useRef, type ReactNode } from "react";

import {
  CHART_COLORS,
  getStatusColor,
} from "~/app/_components/analytics-charts/chart-theme";
import { useChartSize } from "~/app/_components/analytics-charts/use-chart-size";
import { glassCardSurfaceClassName } from "~/components/ui/glass-surface";
import type { StatusChartDatum } from "~/lib/career-ops/chart-data";
import {
  isStatusHighlighted,
  toggleStatusFilter,
} from "~/lib/career-ops/status-filters";
import { cn } from "~/lib/utils";

type StatusRadialChartProps = {
  data: StatusChartDatum[];
  activeStatusFilters: string[];
  onStatusFiltersChange: (statuses: string[]) => void;
};

type ArcDatum = StatusChartDatum & {
  startAngle: number;
  endAngle: number;
  innerRadius: number;
  outerRadius: number;
};

export function StatusRadialChart({
  data,
  activeStatusFilters,
  onStatusFiltersChange,
}: StatusRadialChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, width, height } = useChartSize({
    aspectRatio: 1,
    minHeight: 260,
    maxHeight: 320,
  });

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement || data.length === 0) {
      return;
    }

    const size = Math.min(width, height);
    const radius = size / 2 - 12;
    const innerRadius = radius * 0.42;

    const svg = d3
      .select(svgElement)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("role", "img")
      .attr("aria-label", "Radial chart of application statuses");

    svg.selectAll("*").remove();

    const root = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const angleScale = d3
      .scaleBand()
      .domain(data.map((datum) => datum.status))
      .range([0, 2 * Math.PI])
      .padding(0.14);

    const maxCount = d3.max(data, (datum) => datum.count) ?? 1;
    const radiusScale = d3
      .scaleLinear()
      .domain([0, maxCount])
      .range([innerRadius, radius]);

    const arc = d3
      .arc<ArcDatum>()
      .innerRadius((datum) => datum.innerRadius)
      .outerRadius((datum) => datum.outerRadius)
      .startAngle((datum) => datum.startAngle)
      .endAngle((datum) => datum.endAngle);

    const arcData: ArcDatum[] = data.map((datum) => {
      const startAngle = angleScale(datum.status) ?? 0;
      const endAngle = startAngle + angleScale.bandwidth();

      return {
        ...datum,
        startAngle,
        endAngle,
        innerRadius,
        outerRadius: innerRadius,
      };
    });

    const arcs = root
      .append("g")
      .selectAll("path")
      .data(arcData)
      .join("path")
      .attr("fill", (datum) => getStatusColor(datum.status))
      .attr("opacity", (datum) =>
        isStatusHighlighted(activeStatusFilters, datum.status) ? 0.9 : 0.25,
      )
      .attr("stroke", "#0f1023")
      .attr("stroke-width", 1.5)
      .attr("cursor", "pointer")
      .attr("d", arc);

    arcs
      .transition()
      .duration(700)
      .delay((_, index) => index * 60)
      .attrTween("d", function (datum) {
        const interpolate = d3.interpolate(
          datum.innerRadius,
          radiusScale(datum.count),
        );
        return (time) =>
          arc({
            ...datum,
            outerRadius: interpolate(time),
          }) ?? "";
      });

    arcs.on("click", (_, datum) => {
      onStatusFiltersChange(
        toggleStatusFilter(activeStatusFilters, datum.status),
      );
    });

    root
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.2em")
      .attr("fill", "white")
      .attr("font-size", 24)
      .attr("font-weight", 600)
      .text(d3.sum(data, (datum) => datum.count));

    root
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.2em")
      .attr("fill", CHART_COLORS.label)
      .attr("font-size", 11)
      .text("applications");

    const labelRadius = radius + 8;
    root
      .append("g")
      .selectAll("text")
      .data(data)
      .join("text")
      .attr("transform", (datum) => {
        const angle =
          (angleScale(datum.status) ?? 0) + angleScale.bandwidth() / 2;
        const x = Math.sin(angle) * labelRadius;
        const y = -Math.cos(angle) * labelRadius;
        const rotate = (angle * 180) / Math.PI;
        const flip = angle > Math.PI ? rotate + 180 : rotate;
        return `translate(${x},${y}) rotate(${flip})`;
      })
      .attr("text-anchor", (datum) => {
        const angle =
          (angleScale(datum.status) ?? 0) + angleScale.bandwidth() / 2;
        return angle > Math.PI ? "end" : "start";
      })
      .attr("fill", CHART_COLORS.label)
      .attr("font-size", 10)
      .text((datum) => `${datum.status} (${datum.count})`);

    return () => {
      svg.selectAll("*").remove();
    };
  }, [activeStatusFilters, data, height, onStatusFiltersChange, width]);

  if (data.length === 0) {
    return (
      <ChartFrame
        title="Status orbit"
        description="Radial view of where applications sit in your pipeline."
      >
        <p className="text-sm text-white/50">No status data to chart yet.</p>
      </ChartFrame>
    );
  }

  return (
    <ChartFrame
      title="Status orbit"
      description="Click a segment to filter the tracker by that status."
    >
      <div ref={containerRef}>
        <svg ref={svgRef} className="mx-auto h-auto w-full max-w-[320px]" />
      </div>
    </ChartFrame>
  );
}

function ChartFrame({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        glassCardSurfaceClassName,
        "flex h-full flex-col rounded-xl p-4",
      )}
    >
      <div>
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <p className="mt-1 text-xs text-white/50">{description}</p>
      </div>
      <div className="mt-4 flex flex-1 items-center justify-center">
        {children}
      </div>
    </div>
  );
}
