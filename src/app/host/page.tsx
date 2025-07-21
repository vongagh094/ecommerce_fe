"use client"

import { useDashboardData } from "@/hooks/use-dashboard-data"
import { StatsCards } from "@/components/host/dashboard/stats-cards"
import { SalesOverviewChart } from "@/components/host/dashboard/sales-overview-chart"
import { MetricCards } from "@/components/host/dashboard/metric-cards"

export default function HostDashboard() {
  const { data, loading, error } = useDashboardData()

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-80 bg-gray-200 rounded-2xl mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600">Error loading dashboard data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <StatsCards stats={data.stats} />
      <SalesOverviewChart data={data.chartData} />
      <MetricCards
        bidConversion={data.bidConversion}
        occupancyRatio={data.occupancyRatio}
        occupancyChange={data.occupancyChange}
      />
    </div>
  )
}
