"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"
import type { UserRoleData } from "@/types/admin"

interface UserRoleChartProps {
  data: UserRoleData[]
}

export function UserRoleChart({ data }: UserRoleChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!data || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = 400
    const height = 400
    const radius = Math.min(width, height) / 2 - 40

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`)

    // Color scale
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.role))
      .range(["#3b82f6", "#10b981", "#f59e0b"])

    // Create pie layout
    const pie = d3.pie<UserRoleData>()
      .value(d => d.count)
      .sort(null)

    // Create arc generator
    const arc = d3.arc<d3.PieArcDatum<UserRoleData>>()
      .innerRadius(radius * 0.5)
      .outerRadius(radius)

    const outerArc = d3.arc<d3.PieArcDatum<UserRoleData>>()
      .innerRadius(radius * 1.1)
      .outerRadius(radius * 1.1)

    // Create gradient definitions
    const defs = svg.append("defs")
    
    data.forEach((d, i) => {
      const gradient = defs.append("linearGradient")
        .attr("id", `gradient-${i}`)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "100%")

      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", color(d.role) as string)
        .attr("stop-opacity", 0.8)

      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", d3.color(color(d.role) as string)?.darker(0.5) as string)
        .attr("stop-opacity", 1)
    })

    const pieData = pie(data)

    // Create arcs
    const arcs = g.selectAll(".arc")
      .data(pieData)
      .enter()
      .append("g")
      .attr("class", "arc")

    // Add paths
    arcs.append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => `url(#gradient-${i})`)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("transform", "scale(1.05)")
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("transform", "scale(1)")
      })
      .transition()
      .duration(800)
      .attrTween("d", function(d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d)
        return function(t) {
          return arc(interpolate(t))!
        }
      })

    // Add percentage labels
    arcs.append("text")
      .attr("transform", d => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .style("opacity", 0)
      .text(d => `${d.data.percentage}%`)
      .transition()
      .delay(800)
      .duration(500)
      .style("opacity", 1)

    // Add center text
    const centerText = g.append("g")
      .attr("class", "center-text")

    centerText.append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "24px")
      .attr("font-weight", "bold")
      .attr("fill", "#374151")
      .attr("y", -10)
      .style("opacity", 0)
      .text(d3.sum(data, d => d.count).toLocaleString())
      .transition()
      .delay(1000)
      .duration(500)
      .style("opacity", 1)

    centerText.append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("fill", "#6b7280")
      .attr("y", 10)
      .style("opacity", 0)
      .text("Total Users")
      .transition()
      .delay(1000)
      .duration(500)
      .style("opacity", 1)

    // Legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(20, 20)`)

    const legendItems = legend.selectAll(".legend-item")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 25})`)

    legendItems.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", d => color(d.role) as string)
      .attr("rx", 3)

    legendItems.append("text")
      .attr("x", 25)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .attr("font-size", "12px")
      .attr("fill", "#374151")
      .text(d => `${d.role} (${d.count.toLocaleString()})`)

  }, [data])

  return (
    <div className="flex justify-center">
      <svg ref={svgRef}></svg>
    </div>
  )
}
