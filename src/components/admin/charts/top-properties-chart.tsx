"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"
import type { PropertyPerformanceData } from "@/types/admin"

interface TopPropertiesChartProps {
  data: PropertyPerformanceData[]
  metric: "bookings" | "earnings"
}

export function TopPropertiesChart({ data, metric }: TopPropertiesChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!data || data.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 30, bottom: 80, left: 80 }
    const width = 800 - margin.left - margin.right
    const height = 400 - margin.bottom - margin.top

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Sort and take top 10
    const sortedData = [...data]
      .sort((a, b) => (metric === "bookings" ? b.bookings - a.bookings : b.earnings - a.earnings))
      .slice(0, 10)

    // Scales
    const xScale = d3
      .scaleBand()
      .domain(sortedData.map(d => d.name))
      .range([0, width])
      .padding(0.1)

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(sortedData, d => metric === "bookings" ? d.bookings : d.earnings) || 0])
      .nice()
      .range([height, 0])

    // Create gradient
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "barGradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", height)
      .attr("x2", 0).attr("y2", 0)

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#3b82f6")
      .attr("stop-opacity", 0.8)

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#1d4ed8")
      .attr("stop-opacity", 1)

    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickSize(-height).tickFormat("" as any))
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)

    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale).tickSize(-width).tickFormat("" as any))
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)

    // Bars
    const bars = g.selectAll(".bar")
      .data(sortedData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.name)!)
      .attr("width", xScale.bandwidth())
      .attr("y", height)
      .attr("height", 0)
      .attr("fill", "url(#barGradient)")
      .style("cursor", "pointer")

    // Animate bars
    bars
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr("y", d => yScale(metric === "bookings" ? d.bookings : d.earnings))
      .attr("height", d => height - yScale(metric === "bookings" ? d.bookings : d.earnings))

    // Ranking badges for top 3
    const badges = g.selectAll(".badge")
      .data(sortedData.slice(0, 3))
      .enter()
      .append("g")
      .attr("class", "badge")

    badges
      .append("circle")
      .attr("cx", d => xScale(d.name)! + xScale.bandwidth() / 2)
      .attr("cy", d => yScale(metric === "bookings" ? d.bookings : d.earnings) - 15)
      .attr("r", 12)
      .attr("fill", (d, i) => ["#ffd700", "#c0c0c0", "#cd7f32"][i])
      .style("opacity", 0)
      .transition()
      .delay(1000)
      .duration(500)
      .style("opacity", 1)

    badges
      .append("text")
      .attr("x", d => xScale(d.name)! + xScale.bandwidth() / 2)
      .attr("y", d => yScale(metric === "bookings" ? d.bookings : d.earnings) - 10)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("fill", "white")
      .text((d, i) => i + 1)
      .style("opacity", 0)
      .transition()
      .delay(1000)
      .duration(500)
      .style("opacity", 1)

    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)")
      .style("font-size", "12px")

    // Y-axis
    const yAxis = g.append("g").call(d3.axisLeft(yScale))
    
    if (metric === "earnings") {
      yAxis.selectAll("text")
        .text(d => `${(+d / 1000000).toFixed(0)}M`)
    }

    // Y-axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .text(metric === "bookings" ? "Number of Bookings" : "Earnings (Million VND)")

    // Tooltip
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("z-index", "1000")

    bars
      .on("mouseover", function(event, d) {
        d3.select(this).style("filter", "brightness(1.2)")
        tooltip
          .style("visibility", "visible")
          .html(`
            <strong>${d.name}</strong><br/>
            Location: ${d.location}<br/>
            Bookings: ${d.bookings}<br/>
            Earnings: ${(d.earnings / 1000000).toFixed(1)}M VND
          `)
      })
      .on("mousemove", function(event) {
        tooltip
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px")
      })
      .on("mouseout", function() {
        d3.select(this).style("filter", "brightness(1)")
        tooltip.style("visibility", "hidden")
      })

    return () => {
      tooltip.remove()
    }
  }, [data, metric])

  return (
    <div className="w-full overflow-x-auto">
      <svg ref={svgRef} className="w-full h-auto"></svg>
    </div>
  )
}
