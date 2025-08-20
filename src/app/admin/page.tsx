"use client"

import { useState } from "react"
import { useAdminData } from "@/hooks/use-admin-data"
import { AdminStatsCards } from "@/components/admin/admin-stats-cards"
import { RevenueChart } from "@/components/admin/charts/revenue-chart"
import { UserGrowthChart } from "@/components/admin/charts/user-growth-chart"
import { BiddingActivityChart } from "@/components/admin/charts/bidding-activity-chart"
import { UserRoleChart } from "@/components/admin/charts/user-role-chart"
import { TopPropertiesChart } from "@/components/admin/charts/top-properties-chart"
import { AnomalyReportsTable } from "@/components/admin/anomaly-reports-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, Users, TrendingUp, PieChart, Trophy } from 'lucide-react'

export default function AdminDashboard() {
  const { stats, revenueData, userGrowthData, loading } = useAdminData()
  const [propertyMetric, setPropertyMetric] = useState<"bookings" | "earnings">("bookings")

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

      {/* Main Charts Section */}
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

      {/* Secondary Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* User Role Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-500" />
              User Role Breakdown
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Distribution of users by their roles on the platform
            </p>
          </CardHeader>
          <CardContent>
            <UserRoleChart data={stats.userRoleDistribution} />
          </CardContent>
        </Card>

        {/* Bidding Activity Chart */}
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

      {/* Top Performing Properties */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Top Performing Properties
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Properties ranked by number of bookings or total earnings
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={propertyMetric === "bookings" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPropertyMetric("bookings")}
                >
                  By Bookings
                </Button>
                <Button
                  variant={propertyMetric === "earnings" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPropertyMetric("earnings")}
                >
                  By Earnings
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TopPropertiesChart data={stats.topProperties} metric={propertyMetric} />
          </CardContent>
        </Card>
      </div>

      {/* Anomaly Reports Table */}
      <div className="mb-8">
        <AnomalyReportsTable reports={stats.anomalyReports} />
      </div>
    </div>
  )
}
