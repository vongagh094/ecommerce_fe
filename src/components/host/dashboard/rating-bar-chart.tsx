"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useRef } from "react"
import * as d3 from "d3"
import { Star } from 'lucide-react'

interface RatingBarChartProps {
  data: { stars: number; count: number }[]
}

export function RatingBarChart({ data }: RatingBarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const margin = { top: 20, right: 20, bottom: 30, left: 40 }
    const width = 300 - margin.left - margin.right
    const height = 200 - margin.top - margin.bottom

    svg.attr("width", width + margin.left + margin.right)
       .attr("height", height + margin.top + margin.bottom)

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Sort data by stars descending for consistent display
    const sortedData = [...data].sort((a, b) => b.stars - a.stars)

    const x = d3.scaleBand()
      .range([0, width])
      .domain(sortedData.map(d => d.stars.toString()))
      .padding(0.3)

    const y = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(sortedData, d => d.count)! + 5]) // Add some padding to max

    // Add X axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d => `${d} Star`))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#6B7280")

    // Add Y axis
    g.append("g")
      .call(d3.axisLeft(y).ticks(5))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#6B7280")

    // Add bars
    g.selectAll(".bar")
      .data(sortedData)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.stars.toString())!)
      .attr("y", height) // Start from bottom for animation
      .attr("width", x.bandwidth())
      .attr("height", 0) // Start with 0 height for animation
      .attr("fill", "#3B82F6") // Blue color for bars
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .ease(d3.easeElasticOut)
      .attr("y", d => y(d.count))
      .attr("height", d => height - y(d.count))

    // Add count labels on top of bars
    g.selectAll(".bar-label")
      .data(sortedData)
      .enter().append("text")
      .attr("class", "bar-label")
      .attr("x", d => x(d.stars.toString())! + x.bandwidth() / 2)
      .attr("y", d => y(d.count) - 5) // Position above the bar
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("fill", "#1F2937")
      .style("opacity", 0) // Start hidden for animation
      .text(d => d.count.toString())
      .transition()
      .duration(800)
      .delay((d, i) => i * 100 + 800) // Appear after bars
      .style("opacity", 1)

  }, [data])

  return (
    <Card className="border border-gray-200 rounded-2xl">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
        <div className="flex justify-center">
          <svg ref={svgRef}></svg>
        </div>
        <div className="mt-4 text-center text-sm text-gray-600">
          Distribution of guest ratings across star categories.
        </div>
      </CardContent>
    </Card>
  )
}
