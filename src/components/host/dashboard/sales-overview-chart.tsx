"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import type { ChartDataPoint } from "@/types/host"

interface SalesOverviewChartProps {
  data: ChartDataPoint[]
}

export function SalesOverviewChart({ data }: SalesOverviewChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!data.length || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 30, bottom: 40, left: 50 }
    const width = 600 - margin.left - margin.right
    const height = 250 - margin.top - margin.bottom

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
      .domain([0, d3.max(processedData, (d) => d.value) || 0])
      .nice()
      .range([height, 0])

    const line = d3
      .line<(typeof processedData)[0]>()
      .x((d) => x(d.date))
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX)

    const area = d3
      .area<(typeof processedData)[0]>()
      .x((d) => x(d.date))
      .y0(height)
      .y1((d) => y(d.value))
      .curve(d3.curveMonotoneX)

    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "area-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", height)
      .attr("x2", 0)
      .attr("y2", 0)

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#22d3ee").attr("stop-opacity", 0.1)

    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#22d3ee").attr("stop-opacity", 0.8)

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

    g.append("path").datum(processedData).attr("fill", "url(#area-gradient)").attr("d", area)

    g.append("path")
      .datum(processedData)
      .attr("fill", "none")
      .attr("stroke", "#22d3ee")
      .attr("stroke-width", 3)
      .attr("d", line)

    g.selectAll(".dot")
      .data(processedData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(d.date))
      .attr("cy", (d) => y(d.value))
      .attr("r", 4)
      .attr("fill", "#22d3ee")
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
          .html(`<strong>${d.month}</strong><br/>Sales: ${(d.value / 1000000).toFixed(1)}M VND`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px")
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 4)

        d3.selectAll(".tooltip").remove()
      })
  }, [data])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <Card className="lg:col-span-2 border border-gray-200 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sales overview</h3>
              <p className="text-sm text-green-600">(+5) more in 2025</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="text-sm bg-transparent">
                Choose which room or all rooms
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="text-sm bg-transparent">
                October
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <svg ref={svgRef} className="w-full h-auto"></svg>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="border border-gray-200 rounded-2xl">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-cyan-600 text-xl">💰</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Expected sales</p>
            <p className="text-xl font-semibold text-gray-900">5.000.000 đ</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 rounded-2xl">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span className="text-cyan-600 text-xl">💰</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Sales</p>
            <p className="text-xl font-semibold text-gray-900">10.000.000 đ</p>
            <p className="text-sm text-green-600">(+ 5.000.000 đ)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
