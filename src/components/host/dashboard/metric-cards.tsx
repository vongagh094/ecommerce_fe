"use client"

import { CreditCard } from "lucide-react"
import type { ChartData } from "@/types/host"

interface MetricCardsProps {
  data: ChartData
}

export function MetricCards({ data }: MetricCardsProps) {
  const formatCurrency = (amount: number) => {
    return `${(amount / 1000000).toFixed(1)}M đ`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Sales Cards */}
      <div className="space-y-6">
        {/* Expected Sales */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-900 mb-1">Expected sales</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.expectedSales)}</p>
            </div>
            <div className="p-3 rounded-xl bg-teal-100">
              <CreditCard className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-gray-900 mb-1">Sales</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.totalSales)}</p>
              <p className="text-sm text-green-600 font-medium">(+ {formatCurrency(data.salesIncrease)})</p>
            </div>
            <div className="p-3 rounded-xl bg-teal-100">
              <CreditCard className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Performance Cards */}
      <div className="space-y-6">
        {/* Bid Conversion */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Bid conversion</p>
              <p className="text-3xl font-bold text-gray-900">{data.bidConversion}</p>
            </div>
            <div className="p-3 rounded-xl bg-teal-100">
              <CreditCard className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </div>

        {/* Occupancy Ratio */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Occupany ratio</p>
              <div className="flex items-center space-x-2">
                <p className="text-3xl font-bold text-gray-900">{data.occupancyRatio}%</p>
                <p className="text-sm text-red-500 font-medium">{data.occupancyChange}%</p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-teal-100">
              <CreditCard className="h-6 w-6 text-teal-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
