"use client"

import { useState, useEffect } from "react"
import type { DashboardStats, ChartData } from "@/types/host"

// Mock data - replace with actual API calls
const mockDashboardStats: DashboardStats = {
  totalListing: 300,
  totalBidActive: 20,
  totalBooking: 40,
  sales: 2400000,
}

const mockChartData: ChartData = {
  salesOverview: [
    { month: "Jan", amount: 1200000 },
    { month: "Feb", amount: 1800000 },
    { month: "Mar", amount: 2200000 },
    { month: "Apr", amount: 1900000 },
    { month: "May", amount: 2800000 },
    { month: "Jun", amount: 3200000 },
    { month: "Jul", amount: 2900000 },
    { month: "Aug", amount: 3500000 },
    { month: "Sep", amount: 3100000 },
    { month: "Oct", amount: 2700000 },
    { month: "Nov", amount: 2400000 },
    { month: "Dec", amount: 2800000 },
  ],
  expectedSales: 5000000,
  totalSales: 10000000,
  salesIncrease: 5000000,
  bidConversion: 200,
  occupancyRatio: 70,
  occupancyChange: -14,
}

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      try {
        setLoading(true)
        // Replace with actual API calls
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setStats(mockDashboardStats)
        setChartData(mockChartData)
      } catch (err) {
        setError("Failed to fetch dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { stats, chartData, loading, error }
}
