"use client"

import { useState, useEffect } from "react"
import type { HostDashboardData } from "@/types/host"

export function useDashboardData() {
  const [data, setData] = useState<HostDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data - replace with actual API call
        const mockData: HostDashboardData = {
          stats: {
            totalListing: 300,
            totalBidActive: 20,
            totalBooking: 40,
            sales: 2400000,
          },
          chartData: [
            { month: "Jan", value: 1200000 },
            { month: "Feb", value: 1800000 },
            { month: "Mar", value: 2200000 },
            { month: "Apr", value: 1900000 },
            { month: "May", value: 2500000 },
            { month: "Jun", value: 2800000 },
            { month: "Jul", value: 3200000 },
            { month: "Aug", value: 2900000 },
            { month: "Sep", value: 3100000 },
            { month: "Oct", value: 2700000 },
            { month: "Nov", value: 3000000 },
            { month: "Dec", value: 3400000 },
          ],
          expectedSales: 5000000,
          totalSales: 10000000,
          salesIncrease: 5000000,
          bidConversion: 200,
          occupancyRatio: 70,
          occupancyChange: -14,
        }

        await new Promise((resolve) => setTimeout(resolve, 1000))
        setData(mockData)
      } catch (err) {
        setError("Failed to fetch dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}
