"use client"

import { useDashboardData } from "@/hooks/use-dashboard-data"
import { StatsCards } from "@/components/host/dashboard/stats-cards"
import { SalesOverviewChart } from "@/components/host/dashboard/sales-overview-chart"
import { MetricCards } from "@/components/host/dashboard/metric-cards"

export default function HostDashboard() {
  const { stats, chartData, loading, error } = useDashboardData()

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-2xl h-32"></div>
            ))}
          </div>
          <div className="bg-gray-200 rounded-2xl h-96 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-2xl h-32"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      </div>
    )
  }

  if (!stats || !chartData) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Sales Overview Chart */}
      <SalesOverviewChart data={chartData.salesOverview} />

      {/* Metric Cards */}
      <MetricCards data={chartData} />
    </div>
  )
}
