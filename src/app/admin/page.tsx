"use client"

import { useAdminData } from "@/hooks/use-admin-data"
import { AdminStatsCards } from "@/components/admin/admin-stats-cards"
import { RevenueChart } from "@/components/admin/charts/revenue-chart"
import { UserGrowthChart } from "@/components/admin/charts/user-growth-chart"
import { BiddingActivityChart } from "@/components/admin/charts/bidding-activity-chart"
import { ActiveBiddingsTable } from "@/components/admin/active-biddings-table"
import { AnomalyReportsTable } from "@/components/admin/anomaly-reports-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, Users, TrendingUp } from "lucide-react"

export default function AdminDashboard() {
  const { stats, revenueData, userGrowthData, loading } = useAdminData()

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor platform activity and performance</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Unable to load data</h1>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Monitor Sky-high platform activity and performance</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8">
        <AdminStatsCards stats={stats} />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Revenue & Platform Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenueData} />
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserGrowthChart data={userGrowthData} />
          </CardContent>
        </Card>
      </div>

      {/* Bidding Activity Chart */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Bidding Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <BiddingActivityChart data={[]} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Section */}
      <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-2">
        {/* Active Biddings */}
        <ActiveBiddingsTable biddings={stats.activeBiddings} />

        {/* Anomaly Reports */}
        <AnomalyReportsTable reports={stats.anomalyReports} />
      </div>
    </div>
  )
}
