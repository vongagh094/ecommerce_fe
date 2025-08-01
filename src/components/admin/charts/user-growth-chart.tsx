"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"
import type { UserGrowthData } from "@/types/admin"

interface UserGrowthChartProps {
  data: UserGrowthData[]
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!data.length || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 80, bottom: 40, left: 60 }
    const width = 600 - margin.left - margin.right
    const height = 300 - margin.bottom - margin.top

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Scales
    const x = d3
      .scalePoint()
      .domain(data.map((d) => d.month))
      .range([0, width])

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.total) || 0])
      .range([height, 0])

    // Line generator
    const line = d3
      .line<UserGrowthData>()
      .x((d) => x(d.month)!)
      .y((d) => y(d.total))
      .curve(d3.curveMonotoneX)

    const guestsLine = d3
      .line<UserGrowthData>()
      .x((d) => x(d.month)!)
      .y((d) => y(d.guests))
      .curve(d3.curveMonotoneX)

    const hostsLine = d3
      .line<UserGrowthData>()
      .x((d) => x(d.month)!)
      .y((d) => y(d.hosts))
      .curve(d3.curveMonotoneX)

    // X axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-size", "12px")

    // Y axis
    g.append("g")
      .call(d3.axisLeft(y).tickFormat((d) => `${((d as number) / 1000).toFixed(0)}K`))
      .selectAll("text")
      .style("font-size", "12px")

    // Grid lines
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

    // Total users line
    g.append("path").datum(data).attr("fill", "none").attr("stroke", "#3b82f6").attr("stroke-width", 3).attr("d", line)

    // Guests line
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 2)
      .attr("d", guestsLine)

    // Hosts line
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 2)
      .attr("d", hostsLine)

    // Data points for total users
    g.selectAll(".dot-total")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot-total")
      .attr("cx", (d) => x(d.month)!)
      .attr("cy", (d) => y(d.total))
      .attr("r", 4)
      .attr("fill", "#3b82f6")
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
          .html(`Total Users: ${d.total.toLocaleString()}`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px")
      })
      .on("mouseout", () => {
        d3.selectAll(".tooltip").remove()
      })

    // Data points for guests
    g.selectAll(".dot-guests")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot-guests")
      .attr("cx", (d) => x(d.month)!)
      .attr("cy", (d) => y(d.guests))
      .attr("r", 3)
      .attr("fill", "#10b981")
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
          .html(`Guests: ${d.guests.toLocaleString()}`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px")
      })
      .on("mouseout", () => {
        d3.selectAll(".tooltip").remove()
      })

    // Data points for hosts
    g.selectAll(".dot-hosts")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot-hosts")
      .attr("cx", (d) => x(d.month)!)
      .attr("cy", (d) => y(d.hosts))
      .attr("r", 3)
      .attr("fill", "#f59e0b")
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
          .html(`Hosts: ${d.hosts.toLocaleString()}`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px")
      })
      .on("mouseout", () => {
        d3.selectAll(".tooltip").remove()
      })

    // Legend
    const legend = g.append("g").attr("transform", `translate(${width - 100}, 20)`)

    const legendItems = [
      { key: "total", label: "Total Users", color: "#3b82f6" },
      { key: "guests", label: "Guests", color: "#10b981" },
      { key: "hosts", label: "Hosts", color: "#f59e0b" },
    ]

    const legendItem = legend
      .selectAll(".legend-item")
      .data(legendItems)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`)

    legendItem
      .append("circle")
      .attr("cx", 6)
      .attr("cy", 6)
      .attr("r", 4)
      .attr("fill", (d) => d.color)

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
