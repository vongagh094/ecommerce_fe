"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { Button } from "@/components/ui/button"
import type { OccupancyDataPoint } from "@/types/host"

interface OccupancyChartProps {
  data: OccupancyDataPoint[]
}

export function OccupancyChart({ data }: OccupancyChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "weekly" | "monthly">("daily")

  useEffect(() => {
    if (!data.length || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 30, bottom: 40, left: 50 }
    const width = 500 - margin.left - margin.right
    const height = 250 - margin.top - margin.bottom

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Filter data by selected period
    const filteredData = data.filter(d => d.period === selectedPeriod)

    // Parse dates and create scales
    const parseTime = d3.timeParse("%Y-%m-%d")
    const processedData = filteredData.map(d => ({
      ...d,
      date: parseTime(d.date) || new Date(),
    }))

    const x = d3
      .scaleTime()
      .domain(d3.extent(processedData, d => d.date) as [Date, Date])
      .range([0, width])

    const y = d3
      .scaleLinear()
      .domain([0, 100])
      .range([height, 0])

    // Create line generator
    const line = d3
      .line<typeof processedData[0]>()
      .x(d => x(d.date))
      .y(d => y(d.occupancyRate))
      .curve(d3.curveMonotoneX)

    // Create area generator
    const area = d3
      .area<typeof processedData[0]>()
      .x(d => x(d.date))
      .y0(height)
      .y1(d => y(d.occupancyRate))
      .curve(d3.curveMonotoneX)

    // Add gradient
    const defs = svg.append("defs")
    const gradient = defs
      .append("linearGradient")
      .attr("id", "occupancyGradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", height)
      .attr("x2", 0).attr("y2", 0)

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#3B82F6").attr("stop-opacity", 0.1)
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#3B82F6").attr("stop-opacity", 0.6)

    // Add grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x)
        .tickSize(-height)
        .tickFormat(() => "")
      )
      .selectAll("line")
      .style("stroke", "#E5E7EB")
      .style("stroke-width", 1)

    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat(() => "")
      )
      .selectAll("line")
      .style("stroke", "#E5E7EB")
      .style("stroke-width", 1)

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m/%d")))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#6B7280")

    g.append("g")
      .call(d3.axisLeft(y).tickFormat(d => `${d}%`))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#6B7280")

    // Add area with animation
    const areaPath = g.append("path")
      .datum(processedData)
      .attr("fill", "url(#occupancyGradient)")
      .attr("d", area)

    const totalLength = (areaPath.node() as SVGPathElement).getTotalLength()
    areaPath
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .style("opacity", 1)

    // Add line with animation
    const linePath = g.append("path")
      .datum(processedData)
      .attr("fill", "none")
      .attr("stroke", "#3B82F6")
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round")
      .attr("d", line)

    const lineLength = (linePath.node() as SVGPathElement).getTotalLength()
    linePath
      .attr("stroke-dasharray", `${lineLength} ${lineLength}`)
      .attr("stroke-dashoffset", lineLength)
      .transition()
      .duration(1500)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0)

    // Add dots with staggered animation
    g.selectAll(".dot")
      .data(processedData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d.occupancyRate))
      .attr("r", 0)
      .style("fill", "#3B82F6")
      .style("stroke", "white")
      .style("stroke-width", 2)
      .transition()
      .duration(300)
      .delay((d, i) => i * 100 + 1000)
      .attr("r", 4)

    // Add tooltips
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "occupancy-tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px 12px")
      .style("border-radius", "6px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0)

    g.selectAll(".dot")
      .on("mouseover", (event, d: any) => {
        tooltip.transition().duration(200).style("opacity", 1)
        tooltip
          .html(`Date: ${d3.timeFormat("%B %d, %Y")(d.date)}<br/>Occupancy: ${d.occupancyRate}%`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px")
      })
      .on("mouseout", () => {
        tooltip.transition().duration(200).style("opacity", 0)
      })

    // Cleanup tooltip on unmount
    return () => {
      d3.selectAll(".occupancy-tooltip").remove()
    }

  }, [data, selectedPeriod])

  return (
    <Card className="border border-gray-200 rounded-2xl">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Occupancy Over Time</h3>
          <div className="flex space-x-2">
            {(["daily", "weekly", "monthly"] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
                className="capitalize"
              >
                {period}
              </Button>
            ))}
          </div>
        </div>
        <div className="h-64">
          <svg ref={svgRef} className="w-full h-full"></svg>
        </div>
      </CardContent>
    </Card>
  )
}
