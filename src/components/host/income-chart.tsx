"use client"

import { useMemo } from "react"

interface IncomeChartProps {
  data: Array<{ day: number; amount: number }>
}

export function IncomeChart({ data }: IncomeChartProps) {
  const { maxAmount, chartPoints, peakPoint } = useMemo(() => {
    const maxAmount = Math.max(...data.map((d) => d.amount))
    const minAmount = Math.min(...data.map((d) => d.amount))
    const range = maxAmount - minAmount

    // Chart dimensions
    const chartWidth = 800
    const chartHeight = 300
    const padding = 40

    const chartPoints = data.map((point, index) => {
      const x = padding + (index / (data.length - 1)) * (chartWidth - 2 * padding)
      const y = chartHeight - padding - ((point.amount - minAmount) / range) * (chartHeight - 2 * padding)
      return { x, y, amount: point.amount, day: point.day }
    })

    const peakPoint = chartPoints.find((p) => p.amount === maxAmount)

    return { maxAmount, chartPoints, peakPoint }
  }, [data])

  // Create SVG path for the line
  const linePath = chartPoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")

  // Create SVG path for the filled area
  const areaPath = `${linePath} L ${chartPoints[chartPoints.length - 1].x} ${300 - 40} L ${chartPoints[0].x} ${300 - 40} Z`

  // Y-axis labels
  const yAxisLabels = [
    { value: 200000, label: "200,000" },
    { value: 400000, label: "400,000" },
    { value: 600000, label: "600,000" },
    { value: 800000, label: "800,000" },
    { value: 1000000, label: "1,000,000" },
  ]

  // X-axis labels (every 3 days)
  const xAxisLabels = [1, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 31]

  return (
    <div className="w-full">
      <svg width="100%" height="400" viewBox="0 0 800 400" className="overflow-visible">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Y-axis labels */}
        {yAxisLabels.map((label) => {
          const y = 300 - 40 - ((label.value - 200000) / 800000) * (300 - 80)
          return (
            <g key={label.value}>
              <line x1="35" y1={y} x2="760" y2={y} stroke="#f3f4f6" strokeWidth="1" />
              <text x="30" y={y + 5} textAnchor="end" className="text-xs fill-gray-500">
                {label.label}
              </text>
            </g>
          )
        })}

        {/* X-axis labels */}
        {xAxisLabels.map((day) => {
          const x = 40 + ((day - 1) / 30) * (800 - 80)
          return (
            <text key={day} x={x} y="380" textAnchor="middle" className="text-xs fill-gray-500">
              {day}
            </text>
          )
        })}

        {/* Filled area under the line */}
        <path d={areaPath} fill="url(#blueGradient)" opacity="0.3" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2" />

        {/* Data points */}
        {chartPoints.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#3b82f6"
            className="hover:r-6 transition-all cursor-pointer"
          />
        ))}

        {/* Peak point highlight */}
        {peakPoint && (
          <g>
            <circle cx={peakPoint.x} cy={peakPoint.y} r="6" fill="#3b82f6" stroke="white" strokeWidth="2" />
            {/* Peak value tooltip */}
            <g>
              <rect x={peakPoint.x - 35} y={peakPoint.y - 35} width="70" height="25" rx="4" fill="#3b82f6" />
              <text x={peakPoint.x} y={peakPoint.y - 18} textAnchor="middle" className="text-xs fill-white font-medium">
                {(peakPoint.amount / 1000).toFixed(0)},000
              </text>
            </g>
          </g>
        )}

        {/* Gradient definition */}
        <defs>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}
