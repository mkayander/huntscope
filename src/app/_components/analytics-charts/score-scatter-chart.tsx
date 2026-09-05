"use client";

import * as d3 from "d3";
import { useEffect, useRef, useState, type ReactNode } from "react";

import {
  CHART_COLORS,
  CHART_MARGIN,
  getStatusColor,
} from "~/app/_components/analytics-charts/chart-theme";
import { useChartSize } from "~/app/_components/analytics-charts/use-chart-size";
import type { ScoreScatterDatum } from "~/lib/career-ops/chart-data";
import { formatApplicationDate } from "~/lib/i18n/date-format";

type ScoreScatterChartProps = {
  data: ScoreScatterDatum[];
  activeStatusFilter: string | null;
  onStatusFilterChange: (status: string | null) => void;
};

type TooltipState = {
  x: number;
  y: number;
  point: ScoreScatterDatum;
} | null;

export function ScoreScatterChart({
  data,
  activeStatusFilter,
  onStatusFilterChange,
}: ScoreScatterChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, width, height } = useChartSize({ aspectRatio: 0.48, maxHeight: 340 });
  const [tooltip, setTooltip] = useState<TooltipState>(null);

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
      .attr("aria-label", "Scatter plot of application scores over time");

    svg.selectAll("*").remove();

    const root = svg
      .append("g")
      .attr("transform", `translate(${CHART_MARGIN.left},${CHART_MARGIN.top})`);

    const xExtent = d3.extent(data, (point) => point.date) as [Date, Date];
    const xPadding = (xExtent[1].getTime() - xExtent[0].getTime()) * 0.05 || 86_400_000;

    const xScale = d3
      .scaleTime()
      .domain([
        new Date(xExtent[0].getTime() - xPadding),
        new Date(xExtent[1].getTime() + xPadding),
      ])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear().domain([0, 5]).range([innerHeight, 0]).nice();

    const xAxis = d3
      .axisBottom(xScale)
      .ticks(Math.min(6, data.length))
      .tickSizeOuter(0)
      .tickPadding(8);

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(5)
      .tickSize(-innerWidth)
      .tickSizeOuter(0)
      .tickPadding(8);

    root
      .append("g")
      .attr("class", "grid")
      .call(yAxis)
      .call((group) => group.select(".domain").remove())
      .call((group) =>
        group.selectAll(".tick line").attr("stroke", CHART_COLORS.grid),
      )
      .call((group) =>
        group.selectAll(".tick text").attr("fill", CHART_COLORS.label).attr("font-size", 11),
      );

    root
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .call((group) => group.select(".domain").attr("stroke", CHART_COLORS.axis))
      .call((group) =>
        group.selectAll(".tick text").attr("fill", CHART_COLORS.label).attr("font-size", 11),
      );

    const fitLineY = yScale(4);
    root
      .append("line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", fitLineY)
      .attr("y2", fitLineY)
      .attr("stroke", CHART_COLORS.emerald)
      .attr("stroke-opacity", 0.35)
      .attr("stroke-dasharray", "4 4");

    root
      .append("text")
      .attr("x", innerWidth - 4)
      .attr("y", fitLineY - 6)
      .attr("text-anchor", "end")
      .attr("fill", CHART_COLORS.emerald)
      .attr("font-size", 10)
      .text("Top fit ≥ 4");

    const points = root
      .append("g")
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (point) => xScale(point.date))
      .attr("cy", (point) => yScale(point.score))
      .attr("r", 0)
      .attr("fill", (point) => getStatusColor(point.status))
      .attr("stroke", "#0f1023")
      .attr("stroke-width", 1.5)
      .attr("opacity", (point) =>
        activeStatusFilter && point.status !== activeStatusFilter ? 0.2 : 0.92,
      )
      .attr("cursor", "pointer");

    points
      .transition()
      .duration(650)
      .delay((_, index) => index * 12)
      .attr("r", 6);

    points
      .on("mouseenter", function (event, point) {
        d3.select(this).attr("r", 8).attr("stroke", "#fff").attr("stroke-width", 2);
        setTooltip({
          x: event.offsetX,
          y: event.offsetY,
          point,
        });
      })
      .on("mousemove", (event, point) => {
        setTooltip({
          x: event.offsetX,
          y: event.offsetY,
          point,
        });
      })
      .on("mouseleave", function () {
        d3.select(this).attr("r", 6).attr("stroke", "#0f1023").attr("stroke-width", 1.5);
        setTooltip(null);
      })
      .on("click", (_, point) => {
        onStatusFilterChange(activeStatusFilter === point.status ? null : point.status);
      });

    return () => {
      svg.selectAll("*").remove();
    };
  }, [activeStatusFilter, data, height, onStatusFilterChange, width]);

  if (data.length === 0) {
    return (
      <ChartFrame
        title="Score landscape"
        description="Each dot is an evaluated role. Y-axis is fit score, X-axis is evaluation date."
      >
        <p className="text-sm text-white/50">No scored applications with dates to chart yet.</p>
      </ChartFrame>
    );
  }

  return (
    <ChartFrame
      title="Score landscape"
      description="Each dot is an evaluated role. Click a dot to filter the tracker by status."
    >
      <div ref={containerRef} className="relative">
        <svg ref={svgRef} className="h-auto w-full overflow-visible" />
        {tooltip ? (
          <div
            className="pointer-events-none absolute z-10 max-w-[14rem] rounded-lg border px-3 py-2 text-xs shadow-lg"
            style={{
              left: tooltip.x + 12,
              top: tooltip.y - 8,
              background: CHART_COLORS.tooltipBg,
              borderColor: CHART_COLORS.tooltipBorder,
            }}
          >
            <p className="font-semibold text-white">{tooltip.point.company}</p>
            <p className="mt-0.5 text-white/70">{tooltip.point.role}</p>
            <p className="mt-2 text-white/80">
              Score <span className="font-medium text-violet-200">{tooltip.point.score}</span>
              {" · "}
              {tooltip.point.status}
            </p>
            <p className="mt-1 text-white/50">
              {formatApplicationDate(tooltip.point.dateKey, "en")}
            </p>
          </div>
        ) : null}
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
    <div className="flex h-full flex-col rounded-xl border border-white/10 bg-black/20 p-4">
      <div>
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <p className="mt-1 text-xs text-white/50">{description}</p>
      </div>
      <div className="mt-4 min-h-[220px] flex-1">{children}</div>
    </div>
  );
}
