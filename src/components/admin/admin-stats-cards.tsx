"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Home, TrendingUp, DollarSign } from "lucide-react"
import type { AdminStats } from "@/types/admin"

interface AdminStatsCardsProps {
  stats: AdminStats
}

export function AdminStatsCards({ stats }: AdminStatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.totalUsers.total)}</div>
          <div className="text-xs text-muted-foreground mt-2 space-y-1">
            <div className="flex justify-between">
              <span>Guests:</span>
              <span className="font-medium">{formatNumber(stats.totalUsers.guests)}</span>
            </div>
            <div className="flex justify-between">
              <span>Hosts:</span>
              <span className="font-medium">{formatNumber(stats.totalUsers.hosts)}</span>
            </div>
            <div className="flex justify-between">
              <span>Both:</span>
              <span className="font-medium">{formatNumber(stats.totalUsers.both)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Rooms */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Properties</CardTitle>
          <Home className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.activeRooms)}</div>
          <p className="text-xs text-muted-foreground">+12% from last month</p>
        </CardContent>
      </Card>

      {/* Bidding Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bidding Activity</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats.bidding.monthly)}</div>
          <div className="text-xs text-muted-foreground mt-2 space-y-1">
            <div className="flex justify-between">
              <span>Today:</span>
              <span className="font-medium">{formatNumber(stats.bidding.daily)}</span>
            </div>
            <div className="flex justify-between">
              <span>This week:</span>
              <span className="font-medium">{formatNumber(stats.bidding.weekly)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue & Fees</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.revenue.totalRevenue)}</div>
          <div className="text-xs text-muted-foreground mt-2">
            <div className="flex justify-between">
              <span>Platform fees:</span>
              <span className="font-medium">{formatCurrency(stats.revenue.platformFees)}</span>
            </div>
            <div className="flex items-center mt-1">
              <span className="text-green-600">+{stats.revenue.growth}%</span>
              <span className="ml-1">from last month</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
