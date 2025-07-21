"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SalesData } from "@/types/host"

interface SalesOverviewChartProps {
  data: SalesData[]
}

export function SalesOverviewChart({ data }: SalesOverviewChartProps) {
  const [selectedRoom, setSelectedRoom] = useState("all")
  const [selectedMonth, setSelectedMonth] = useState("october")
  const [showRoomDropdown, setShowRoomDropdown] = useState(false)
  const [showMonthDropdown, setShowMonthDropdown] = useState(false)

  const rooms = [
    { id: "all", name: "Choose which room or all rooms" },
    { id: "deluxe", name: "Deluxe Ocean View Suite" },
    { id: "garden", name: "Garden Villa with Pool" },
    { id: "mountain", name: "Cozy Mountain Cabin" },
  ]

  const months = [
    { id: "october", name: "October" },
    { id: "september", name: "September" },
    { id: "august", name: "August" },
    { id: "july", name: "July" },
  ]

  // Create SVG chart
  const maxAmount = Math.max(...data.map((d) => d.amount))
  const chartWidth = 800
  const chartHeight = 300
  const padding = 60

  const points = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * (chartWidth - 2 * padding)
    const y = chartHeight - padding - (point.amount / maxAmount) * (chartHeight - 2 * padding)
    return { x, y, amount: point.amount, month: point.month }
  })

  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Sales overview</h2>
          <p className="text-sm text-green-600 font-medium">(+5) more in 2025</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Room Selector */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => {
                setShowRoomDropdown(!showRoomDropdown)
                setShowMonthDropdown(false)
              }}
              className="flex items-center space-x-2 min-w-[250px] justify-between text-gray-500"
            >
              <span>{rooms.find((r) => r.id === selectedRoom)?.name}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>

            {showRoomDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => {
                      setSelectedRoom(room.id)
                      setShowRoomDropdown(false)
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    {room.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Month Selector */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => {
                setShowMonthDropdown(!showMonthDropdown)
                setShowRoomDropdown(false)
              }}
              className="flex items-center space-x-2 min-w-[120px] justify-between"
            >
              <span className="capitalize">{months.find((m) => m.id === selectedMonth)?.name}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>

            {showMonthDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {months.map((month) => (
                  <button
                    key={month.id}
                    onClick={() => {
                      setSelectedMonth(month.id)
                      setShowMonthDropdown(false)
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    {month.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-80">
        <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const y = chartHeight - padding - (i / 5) * (chartHeight - 2 * padding)
            return (
              <g key={i}>
                <line x1={padding} y1={y} x2={chartWidth - padding} y2={y} stroke="#f3f4f6" strokeWidth="1" />
                <text x={padding - 10} y={y + 5} textAnchor="end" className="text-xs fill-gray-400">
                  {i}M
                </text>
              </g>
            )
          })}

          {/* X-axis labels */}
          {data.map((point, index) => {
            const x = padding + (index / (data.length - 1)) * (chartWidth - 2 * padding)
            return (
              <text key={point.month} x={x} y={chartHeight - 20} textAnchor="middle" className="text-xs fill-gray-400">
                {point.month}
              </text>
            )
          })}

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="salesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Filled area */}
          <path d={areaPath} fill="url(#salesGradient)" />

          {/* Line */}
          <path d={linePath} fill="none" stroke="#14b8a6" strokeWidth="3" />

          {/* Data points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#14b8a6"
              className="hover:r-6 transition-all cursor-pointer"
            />
          ))}
        </svg>
      </div>
    </div>
  )
}
