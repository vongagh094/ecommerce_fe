import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import type { ChartDataPoint } from "@/types/host"

interface SalesOverviewChartProps {
  data: ChartDataPoint[]
}

export function SalesOverviewChart({ data }: SalesOverviewChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value))

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

          <div className="h-64 relative">
            <svg className="w-full h-full" viewBox="0 0 800 200">
              <defs>
                <linearGradient id="salesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#67e8f9" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#a7f3d0" stopOpacity="0.1" />
                </linearGradient>
              </defs>

              <path
                d={`M 0 ${200 - (data[0].value / maxValue) * 150} ${data
                  .map(
                    (point, index) => `L ${(index * 800) / (data.length - 1)} ${200 - (point.value / maxValue) * 150}`,
                  )
                  .join(" ")} L 800 200 L 0 200 Z`}
                fill="url(#salesGradient)"
                stroke="#22d3ee"
                strokeWidth="2"
              />

              {data.map((point, index) => (
                <g key={point.month}>
                  <circle
                    cx={(index * 800) / (data.length - 1)}
                    cy={200 - (point.value / maxValue) * 150}
                    r="4"
                    fill="#22d3ee"
                  />
                  <text
                    x={(index * 800) / (data.length - 1)}
                    y="190"
                    textAnchor="middle"
                    className="text-xs fill-gray-500"
                  >
                    {point.month}
                  </text>
                </g>
              ))}
            </svg>
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
