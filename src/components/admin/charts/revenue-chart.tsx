"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"
import type { RevenueData } from "@/types/admin"

interface RevenueChartProps {
  data: RevenueData[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!data.length || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 80, bottom: 40, left: 80 }
    const width = 600 - margin.left - margin.right
    const height = 300 - margin.bottom - margin.top

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Scales
    const x0 = d3
      .scaleBand()
      .domain(data.map((d) => d.month))
      .range([0, width])
      .padding(0.1)

    const x1 = d3.scaleBand().domain(["revenue", "platformFees"]).range([0, x0.bandwidth()]).padding(0.05)

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => Math.max(d.revenue, d.platformFees)) || 0])
      .range([height, 0])

    // Colors
    const colors = d3.scaleOrdinal().domain(["revenue", "platformFees"]).range(["#3b82f6", "#10b981"])

    // X axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0))
      .selectAll("text")
      .style("font-size", "12px")

    // Y axis
    g.append("g")
      .call(d3.axisLeft(y).tickFormat((d) => `${((d as number) / 1000000).toFixed(0)}M`))
      .selectAll("text")
      .style("font-size", "12px")

    // Bars
    const monthGroups = g
      .selectAll(".month-group")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "month-group")
      .attr("transform", (d) => `translate(${x0(d.month)},0)`)

    // Revenue bars
    monthGroups
      .append("rect")
      .attr("x", x1("revenue")!)
      .attr("y", (d) => y(d.revenue))
      .attr("width", x1.bandwidth())
      .attr("height", (d) => height - y(d.revenue))
      .attr("fill", colors("revenue") as string)
      .attr("rx", 4)
      .on("mouseover", (event, d) => {
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
          .html(`Revenue: ${(d.revenue / 1000000).toFixed(1)}M VND`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px")
      })
      .on("mouseout", () => {
        d3.selectAll(".tooltip").remove()
      })

    // Platform fees bars
    monthGroups
      .append("rect")
      .attr("x", x1("platformFees")!)
      .attr("y", (d) => y(d.platformFees))
      .attr("width", x1.bandwidth())
      .attr("height", (d) => height - y(d.platformFees))
      .attr("fill", colors("platformFees") as string)
      .attr("rx", 4)
      .on("mouseover", (event, d) => {
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
          .html(`Platform Fees: ${(d.platformFees / 1000000).toFixed(1)}M VND`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px")
      })
      .on("mouseout", () => {
        d3.selectAll(".tooltip").remove()
      })

    // Legend
    const legend = g.append("g").attr("transform", `translate(${width - 100}, 20)`)

    const legendItems = [
      { key: "revenue", label: "Revenue", color: "#3b82f6" },
      { key: "platformFees", label: "Platform Fees", color: "#10b981" },
    ]

    const legendItem = legend
      .selectAll(".legend-item")
      .data(legendItems)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`)

    legendItem
      .append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", (d) => d.color)
      .attr("rx", 2)

    legendItem
      .append("text")
      .attr("x", 16)
      .attr("y", 9)
      .style("font-size", "12px")
      .style("fill", "#374151")
      .text((d) => d.label)
  }, [data])

  return (
    <div className="w-full overflow-x-auto">
      <svg ref={svgRef} className="w-full h-auto"></svg>
    </div>
  )
}
