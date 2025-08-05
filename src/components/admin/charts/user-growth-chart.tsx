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
      .domain([0, d3.max(processedData, (d) => d.total) || 0])
      .nice()
      .range([height, 0])

    const totalLine = d3
      .line<(typeof processedData)[0]>()
      .x((d) => x(d.date))
      .y((d) => y(d.total))
      .curve(d3.curveMonotoneX)

    const guestsLine = d3
      .line<(typeof processedData)[0]>()
      .x((d) => x(d.date))
      .y((d) => y(d.guests))
      .curve(d3.curveMonotoneX)

    const hostsLine = d3
      .line<(typeof processedData)[0]>()
      .x((d) => x(d.date))
      .y((d) => y(d.hosts))
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
      .call(d3.axisLeft(y).tickFormat((d) => `${((d as number) / 1000).toFixed(0)}K`))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#6b7280")

    g.append("path")
      .datum(processedData)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 3)
      .attr("d", totalLine)

    g.append("path")
      .datum(processedData)
      .attr("fill", "none")
      .attr("stroke", "#10b981")
      .attr("stroke-width", 2)
      .attr("d", guestsLine)

    g.append("path")
      .datum(processedData)
      .attr("fill", "none")
      .attr("stroke", "#f59e0b")
      .attr("stroke-width", 2)
      .attr("d", hostsLine)

    g.selectAll(".dot-total")
      .data(processedData)
      .enter()
      .append("circle")
      .attr("class", "dot-total")
      .attr("cx", (d) => x(d.date))
      .attr("cy", (d) => y(d.total))
      .attr("r", 5)
      .attr("fill", "#3b82f6")
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("r", 7)

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
          .html(`<strong>${d.month}</strong><br/>Total Users: ${d.total.toLocaleString()}`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px")
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 5)
        d3.selectAll(".tooltip").remove()
      })

    g.selectAll(".dot-guests")
      .data(processedData)
      .enter()
      .append("circle")
      .attr("class", "dot-guests")
      .attr("cx", (d) => x(d.date))
      .attr("cy", (d) => y(d.guests))
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
          .html(`<strong>${d.month}</strong><br/>Guests: ${d.guests.toLocaleString()}`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px")
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 4)
        d3.selectAll(".tooltip").remove()
      })

    g.selectAll(".dot-hosts")
      .data(processedData)
      .enter()
      .append("circle")
      .attr("class", "dot-hosts")
      .attr("cx", (d) => x(d.date))
      .attr("cy", (d) => y(d.hosts))
      .attr("r", 4)
      .attr("fill", "#f59e0b")
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
          .html(`<strong>${d.month}</strong><br/>Hosts: ${d.hosts.toLocaleString()}`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 10 + "px")
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 4)
        d3.selectAll(".tooltip").remove()
      })

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
      .append("line")
      .attr("x1", 0)
      .attr("x2", 15)
      .attr("y1", 6)
      .attr("y2", 6)
      .attr("stroke", (d) => d.color)
      .attr("stroke-width", (d) => (d.key === "total" ? 3 : 2))

    legendItem
      .append("circle")
      .attr("cx", 7.5)
      .attr("cy", 6)
      .attr("r", (d) => (d.key === "total" ? 3 : 2.5))
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
