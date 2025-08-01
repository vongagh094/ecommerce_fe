"use client"

import { useState, useEffect } from "react"
import type { AdminStats, RevenueData, UserGrowthData } from "@/types/admin"

export function useAdminData() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [userGrowthData, setUserGrowthData] = useState<UserGrowthData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call with mock data
    const fetchAdminData = async () => {
      try {
        // Mock delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock admin stats
        const mockStats: AdminStats = {
          totalUsers: {
            total: 15420,
            guests: 12340,
            hosts: 2580,
            both: 500,
          },
          activeRooms: 3240,
          bidding: {
            daily: 45,
            weekly: 312,
            monthly: 1250,
          },
          revenue: {
            totalRevenue: 2500000000, // 2.5 billion VND
            platformFees: 125000000, // 125 million VND
            growth: 15.2,
          },
          activeBiddings: [
            {
              id: "1",
              propertyTitle: "Luxury Villa in Da Nang",
              currentBid: 15000000,
              bidderCount: 8,
              timeRemaining: "2h 15m",
              status: "closing-soon",
              endTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
            },
            {
              id: "2",
              propertyTitle: "Beachfront Apartment in Nha Trang",
              currentBid: 8500000,
              bidderCount: 12,
              timeRemaining: "1d 5h",
              status: "active",
              endTime: new Date(Date.now() + 29 * 60 * 60 * 1000),
            },
            {
              id: "3",
              propertyTitle: "Mountain Resort in Sapa",
              currentBid: 22000000,
              bidderCount: 6,
              timeRemaining: "45m",
              status: "closing-soon",
              endTime: new Date(Date.now() + 45 * 60 * 1000),
            },
            {
              id: "4",
              propertyTitle: "City Center Penthouse in Ho Chi Minh",
              currentBid: 35000000,
              bidderCount: 15,
              timeRemaining: "3d 12h",
              status: "active",
              endTime: new Date(Date.now() + 84 * 60 * 60 * 1000),
            },
          ],
          anomalyReports: [
            {
              id: "1",
              type: "reported-account",
              severity: "high",
              status: "pending",
              description: "User reported for fake property listings and fraudulent behavior",
              userName: "suspicious_user_123",
              userId: "user_123",
              createdAt: new Date("2024-01-15"),
              updatedAt: new Date("2024-01-15"),
            },
            {
              id: "2",
              type: "fraud-behavior",
              severity: "medium",
              status: "investigating",
              description: "Multiple accounts detected from same IP address with coordinated bidding",
              userName: "bidder_network_456",
              userId: "user_456",
              createdAt: new Date("2024-01-14"),
              updatedAt: new Date("2024-01-16"),
            },
            {
              id: "3",
              type: "suspicious-activity",
              severity: "low",
              status: "resolved",
              description: "Unusual bidding pattern detected - resolved as legitimate competitive bidding",
              userName: "active_bidder_789",
              userId: "user_789",
              createdAt: new Date("2024-01-13"),
              updatedAt: new Date("2024-01-17"),
            },
          ],
        }

        // Mock revenue data for charts
        const mockRevenueData: RevenueData[] = [
          { month: "Jan", revenue: 180000000, platformFees: 9000000 },
          { month: "Feb", revenue: 220000000, platformFees: 11000000 },
          { month: "Mar", revenue: 190000000, platformFees: 9500000 },
          { month: "Apr", revenue: 280000000, platformFees: 14000000 },
          { month: "May", revenue: 320000000, platformFees: 16000000 },
          { month: "Jun", revenue: 350000000, platformFees: 17500000 },
          { month: "Jul", revenue: 380000000, platformFees: 19000000 },
          { month: "Aug", revenue: 420000000, platformFees: 21000000 },
          { month: "Sep", revenue: 390000000, platformFees: 19500000 },
          { month: "Oct", revenue: 450000000, platformFees: 22500000 },
          { month: "Nov", revenue: 480000000, platformFees: 24000000 },
          { month: "Dec", revenue: 520000000, platformFees: 26000000 },
        ]

        // Mock user growth data
        const mockUserGrowthData: UserGrowthData[] = [
          { month: "Jan", guests: 8500, hosts: 1200, total: 9700 },
          { month: "Feb", guests: 9200, hosts: 1350, total: 10550 },
          { month: "Mar", guests: 9800, hosts: 1480, total: 11280 },
          { month: "Apr", guests: 10500, hosts: 1620, total: 12120 },
          { month: "May", guests: 11200, hosts: 1780, total: 12980 },
          { month: "Jun", guests: 11800, hosts: 1920, total: 13720 },
          { month: "Jul", guests: 12100, hosts: 2050, total: 14150 },
          { month: "Aug", guests: 12340, hosts: 2180, total: 14520 },
          { month: "Sep", guests: 12280, hosts: 2280, total: 14560 },
          { month: "Oct", guests: 12350, hosts: 2380, total: 14730 },
          { month: "Nov", guests: 12340, hosts: 2480, total: 14820 },
          { month: "Dec", guests: 12340, hosts: 2580, total: 14920 },
        ]

        setStats(mockStats)
        setRevenueData(mockRevenueData)
        setUserGrowthData(mockUserGrowthData)
      } catch (error) {
        console.error("Error fetching admin data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [])

  return {
    stats,
    revenueData,
    userGrowthData,
    loading,
  }
}
