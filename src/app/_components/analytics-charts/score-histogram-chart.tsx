"use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";

import { CHART_COLORS, CHART_MARGIN } from "~/app/_components/analytics-charts/chart-theme";
import { useChartSize } from "~/app/_components/analytics-charts/use-chart-size";
import type { ScoreHistogramDatum } from "~/lib/career-ops/chart-data";

type ScoreHistogramChartProps = {
  data: ScoreHistogramDatum[];
};

export function ScoreHistogramChart({ data }: ScoreHistogramChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { containerRef, width, height } = useChartSize({ aspectRatio: 0.5, maxHeight: 300 });

  const total = data.reduce((sum, bin) => sum + bin.count, 0);

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement || total === 0) {
      return;
    }

    const innerWidth = width - CHART_MARGIN.left - CHART_MARGIN.right;
    const innerHeight = height - CHART_MARGIN.top - CHART_MARGIN.bottom;

    const svg = d3
      .select(svgElement)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("role", "img")
      .attr("aria-label", "Score distribution histogram");

    svg.selectAll("*").remove();

    const root = svg
      .append("g")
      .attr("transform", `translate(${CHART_MARGIN.left},${CHART_MARGIN.top})`);

    const xScale = d3
      .scaleBand()
      .domain(data.map((datum) => datum.label))
      .range([0, innerWidth])
      .padding(0.28);

    const maxCount = d3.max(data, (datum) => datum.count) ?? 1;
    const yScale = d3.scaleLinear().domain([0, maxCount]).range([innerHeight, 0]).nice();

    const barColors = ["#f87171", "#fbbf24", "#a78bfa", "#34d399"];

    root
      .append("g")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (datum) => xScale(datum.label) ?? 0)
      .attr("width", xScale.bandwidth())
      .attr("rx", 6)
      .attr("fill", (_, index) => barColors[index] ?? CHART_COLORS.violet)
      .attr("opacity", 0.88)
      .attr("y", innerHeight)
      .attr("height", 0)
      .transition()
      .duration(700)
      .delay((_, index) => index * 90)
      .attr("y", (datum) => yScale(datum.count))
      .attr("height", (datum) => innerHeight - yScale(datum.count));

    root
      .append("g")
      .selectAll("text.count")
      .data(data.filter((datum) => datum.count > 0))
      .join("text")
      .attr("class", "count")
      .attr("x", (datum) => (xScale(datum.label) ?? 0) + xScale.bandwidth() / 2)
      .attr("y", (datum) => yScale(datum.count) - 8)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", 11)
      .attr("opacity", 0)
      .text((datum) => datum.count)
      .transition()
      .duration(400)
      .delay((_, index) => 500 + index * 90)
      .attr("opacity", 1);

    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0).tickPadding(10);
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
      .call((group) => group.select(".domain").attr("stroke", CHART_COLORS.axis))
      .call((group) =>
        group.selectAll(".tick text").attr("fill", CHART_COLORS.label).attr("font-size", 11),
      );

    root
      .append("g")
      .call(yAxis)
      .call((group) => group.select(".domain").remove())
      .call((group) =>
        group.selectAll(".tick line").attr("stroke", CHART_COLORS.grid),
      )
      .call((group) =>
        group.selectAll(".tick text").attr("fill", CHART_COLORS.label).attr("font-size", 10),
      );

    return () => {
      svg.selectAll("*").remove();
    };
  }, [data, height, total, width]);

  if (total === 0) {
    return (
      <ChartFrame
        title="Fit score distribution"
        description="How your evaluations cluster across score bands."
      >
        <p className="text-sm text-white/50">No scored applications to chart yet.</p>
      </ChartFrame>
    );
  }

  return (
    <ChartFrame
      title="Fit score distribution"
      description="How your evaluations cluster across score bands."
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
    <div className="flex h-full flex-col rounded-xl border border-white/10 bg-black/20 p-4">
      <div>
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <p className="mt-1 text-xs text-white/50">{description}</p>
      </div>
      <div className="mt-4 min-h-[220px] flex-1">{children}</div>
    </div>
  );
}
