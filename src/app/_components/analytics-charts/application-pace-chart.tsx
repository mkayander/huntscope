"use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";

import {
  CHART_COLORS,
  CHART_MARGIN,
} from "~/app/_components/analytics-charts/chart-theme";
import { useChartSize } from "~/app/_components/analytics-charts/use-chart-size";
import { glassCardSurfaceClassName } from "~/components/ui/glass-surface";
import type { TimelineDatum } from "~/lib/career-ops/chart-data";
import { cn } from "~/lib/utils";

type ApplicationPaceChartProps = {
  data: TimelineDatum[];
};

export function ApplicationPaceChart({ data }: ApplicationPaceChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, width, height } = useChartSize({
    aspectRatio: 0.5,
    maxHeight: 300,
  });

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement || data.length === 0) {
      return;
    }

    const innerWidth = width - CHART_MARGIN.left - CHART_MARGIN.right;
    const innerHeight = height - CHART_MARGIN.top - CHART_MARGIN.bottom;

    const svg = d3
      .select(svgElement)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("role", "img")
      .attr("aria-label", "Monthly application pace chart");

    svg.selectAll("*").remove();

    const root = svg
      .append("g")
      .attr("transform", `translate(${CHART_MARGIN.left},${CHART_MARGIN.top})`);

    const xScale = d3
      .scalePoint()
      .domain(data.map((datum) => datum.label))
      .range([0, innerWidth])
      .padding(0.5);

    const maxCount = d3.max(data, (datum) => datum.count) ?? 1;
    const yScale = d3
      .scaleLinear()
      .domain([0, maxCount])
      .range([innerHeight, 0])
      .nice();

    const area = d3
      .area<TimelineDatum>()
      .x((datum) => xScale(datum.label) ?? 0)
      .y0(innerHeight)
      .y1((datum) => yScale(datum.count))
      .curve(d3.curveMonotoneX);

    const line = d3
      .line<TimelineDatum>()
      .x((datum) => xScale(datum.label) ?? 0)
      .y((datum) => yScale(datum.count))
      .curve(d3.curveMonotoneX);

    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "pace-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", CHART_COLORS.violet)
      .attr("stop-opacity", 0.45);
    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", CHART_COLORS.violet)
      .attr("stop-opacity", 0);

    root
      .append("path")
      .datum(data)
      .attr("fill", "url(#pace-gradient)")
      .attr("d", area)
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .attr("opacity", 1);

    const path = root
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", CHART_COLORS.violetBright)
      .attr("stroke-width", 2.5)
      .attr("d", line);

    const pathLength = path.node()?.getTotalLength() ?? 0;
    path
      .attr("stroke-dasharray", `${pathLength} ${pathLength}`)
      .attr("stroke-dashoffset", pathLength)
      .transition()
      .duration(1000)
      .attr("stroke-dashoffset", 0);

    root
      .append("g")
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (datum) => xScale(datum.label) ?? 0)
      .attr("cy", (datum) => yScale(datum.count))
      .attr("r", 0)
      .attr("fill", CHART_COLORS.violetBright)
      .attr("stroke", "#0f1023")
      .attr("stroke-width", 2)
      .transition()
      .duration(500)
      .delay((_, index) => 400 + index * 80)
      .attr("r", 4.5);

    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0).tickPadding(8);
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(4)
      .tickSize(-innerWidth)
      .tickSizeOuter(0)
      .tickPadding(8);

    root
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .call((group) =>
        group.select(".domain").attr("stroke", CHART_COLORS.axis),
      )
      .call((group) =>
        group
          .selectAll(".tick text")
          .attr("fill", CHART_COLORS.label)
          .attr("font-size", 10),
      );

    root
      .append("g")
      .call(yAxis)
      .call((group) => group.select(".domain").remove())
      .call((group) =>
        group.selectAll(".tick line").attr("stroke", CHART_COLORS.grid),
      )
      .call((group) =>
        group
          .selectAll(".tick text")
          .attr("fill", CHART_COLORS.label)
          .attr("font-size", 10),
      );

    return () => {
      svg.selectAll("*").remove();
    };
  }, [data, height, width]);

  if (data.length === 0) {
    return (
      <ChartFrame
        title="Search pace"
        description="Monthly volume of evaluations added to your tracker."
      >
        <p className="text-sm text-white/50">
          No dated applications to chart yet.
        </p>
      </ChartFrame>
    );
  }

  return (
    <ChartFrame
      title="Search pace"
      description="Monthly volume of evaluations added to your tracker."
    >
      <div ref={containerRef}>
        <svg ref={svgRef} className="h-auto w-full overflow-visible" />
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
  children: React.ReactNode;
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
      <div className="mt-4 min-h-[220px] flex-1">{children}</div>
    </div>
  );
}
