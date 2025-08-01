"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

interface BiddingActivityChartProps {
  data: Array<{ label: string; value: number; color: string }>
}

export function BiddingActivityChart({ data: propData }: BiddingActivityChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  // Default data if none provided
  const defaultData = [
    { label: "Daily", value: 45, color: "#3b82f6" },
    { label: "Weekly", value: 312, color: "#10b981" },
    { label: "Monthly", value: 1250, color: "#f59e0b" },
  ]

  const data = propData.length > 0 ? propData : defaultData

  useEffect(() => {
    if (!data.length || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = 400
    const height = 300
    const radius = Math.min(width, height) / 2 - 40

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`)

    // Create pie generator
    const pie = d3
      .pie<(typeof data)[0]>()
      .value((d) => d.value)
      .sort(null)

    // Create arc generator
    const arc = d3
      .arc<d3.PieArcDatum<(typeof data)[0]>>()
      .innerRadius(radius * 0.5)
      .outerRadius(radius)

    const outerArc = d3
      .arc<d3.PieArcDatum<(typeof data)[0]>>()
      .innerRadius(radius * 1.1)
      .outerRadius(radius * 1.1)

    // Generate pie data
    const pieData = pie(data)

    // Create arcs
    const arcs = g.selectAll(".arc").data(pieData).enter().append("g").attr("class", "arc")

    // Add paths
    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => d.data.color)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .on("mouseover", function (event, d) {
        d3.select(this).transition().duration(200).attr("transform", "scale(1.05)")

        const tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("background", "rgba(0, 0, 0, 0.8)")
          .style("color", "white")
          .style("padding", "8px")
          .style("border-radius", "4px")
          .style("font-size", "12px")
          .style("pointer-events", "none")
          .style("opacity", 0)

        tooltip.transition().duration(200).style("opacity", 1)
        tooltip
          .html(`${d.data.label}: ${d.data.value.toLocaleString()} bids`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px")
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(200).attr("transform", "scale(1)")

        d3.selectAll(".tooltip").remove()
      })

    // Add labels
    arcs
      .append("text")
      .attr("transform", (d) => {
        const pos = arc.centroid(d)
        return `translate(${pos})`
      })
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .text((d) => d.data.value.toLocaleString())

    // Add legend
    const legend = svg.append("g").attr("transform", `translate(20, 20)`)

    const legendItems = legend
      .selectAll(".legend-item")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 25})`)

    legendItems
      .append("rect")
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", (d) => d.color)
      .attr("rx", 3)

    legendItems
      .append("text")
      .attr("x", 20)
      .attr("y", 12)
      .style("font-size", "12px")
      .style("fill", "#374151")
      .text((d) => `${d.label}: ${d.value.toLocaleString()}`)
  }, [data])

  return (
    <div className="flex justify-center">
      <svg ref={svgRef} className="w-full h-auto max-w-md"></svg>
    </div>
  )
}
