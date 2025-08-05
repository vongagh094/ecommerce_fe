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
    const height = 300 - margin.top - margin.bottom

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    const parseMonth = d3.timeParse("%b")
    const formatMonth = d3.timeFormat("%b")

    const processedData = data.map((d) => ({
      ...d,
      date: parseMonth(d.month) || new Date(),
    }))

    const x = d3
      .scaleTime()
      .domain(d3.extent(processedData, (d) => d.date) as [Date, Date])
      .range([0, width])

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(processedData, (d) => Math.max(d.revenue, d.platformFees)) || 0])
      .nice()
      .range([height, 0])

    const revenueLine = d3
      .line<(typeof processedData)[0]>()
      .x((d) => x(d.date))
      .y((d) => y(d.revenue))
      .curve(d3.curveMonotoneX)

    const feesLine = d3
      .line<(typeof processedData)[0]>()
      .x((d) => x(d.date))
      .y((d) => y(d.platformFees))
      .curve(d3.curveMonotoneX)

    g.selectAll(".grid-line")
      .data(y.ticks())
      .enter()
      .append("line")
      .attr("class", "grid-line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", (d) => y(d))
      .attr("y2", (d) => y(d))
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 1)
      .attr("opacity", 0.5)

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .tickFormat((d) => formatMonth(d as Date))
          .ticks(d3.timeMonth.every(1)),
      )
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#6b7280")

    g.append("g")
      .call(d3.axisLeft(y).tickFormat((d) => `${((d as number) / 1000000).toFixed(0)}M`))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#6b7280")

    g.append("path")
      .datum(processedData)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 3)
      .attr("d", revenueLine)

    g.append("path")
      .datum(processedData)
      .attr("fill", "none")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 3)
      .attr("d", feesLine)

    g.selectAll(".dot-revenue")
      .data(processedData)
      .enter()
      .append("circle")
      .attr("class", "dot-revenue")
      .attr("cx", (d) => x(d.date))
      .attr("cy", (d) => y(d.revenue))
      .attr("r", 4)
      .attr("fill", "#3b82f6")
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("r", 6)

        const tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("background", "rgba(0, 0, 0, 0.8)")
          .style("color", "white")
          .style("padding", "8px 12px")
          .style("border-radius", "6px")
          .style("font-size", "12px")
          .style("pointer-events", "none")
          .style("opacity", 0)
          .style("z-index", "1000")

        tooltip.transition().duration(200).style("opacity", 1)
        tooltip
          .html(`<strong>${d.month}</strong><br/>Revenue: ${(d.revenue / 1000000).toFixed(1)}M VND`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px")
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 4)
        d3.selectAll(".tooltip").remove()
      })

    g.selectAll(".dot-fees")
      .data(processedData)
      .enter()
      .append("circle")
      .attr("class", "dot-fees")
      .attr("cx", (d) => x(d.date))
      .attr("cy", (d) => y(d.platformFees))
      .attr("r", 4)
      .attr("fill", "#10b981")
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("r", 6)

        const tooltip = d3
          .select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("background", "rgba(0, 0, 0, 0.8)")
          .style("color", "white")
          .style("padding", "8px 12px")
          .style("border-radius", "6px")
          .style("font-size", "12px")
          .style("pointer-events", "none")
          .style("opacity", 0)
          .style("z-index", "1000")

        tooltip.transition().duration(200).style("opacity", 1)
        tooltip
          .html(`<strong>${d.month}</strong><br/>Platform Fees: ${(d.platformFees / 1000000).toFixed(1)}M VND`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px")
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 4)
        d3.selectAll(".tooltip").remove()
      })

    const legend = g.append("g").attr("transform", `translate(${width - 120}, 20)`)

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
      .append("line")
      .attr("x1", 0)
      .attr("x2", 15)
      .attr("y1", 6)
      .attr("y2", 6)
      .attr("stroke", (d) => d.color)
      .attr("stroke-width", 3)

    legendItem
      .append("circle")
      .attr("cx", 7.5)
      .attr("cy", 6)
      .attr("r", 3)
      .attr("fill", (d) => d.color)

    legendItem
      .append("text")
      .attr("x", 20)
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
