"use client"

import { useState, useEffect } from "react"
import type { AdminStats, RevenueData, UserGrowthData, UserRoleData, PropertyPerformanceData } from "@/types/admin"

export function useAdminData() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [userGrowthData, setUserGrowthData] = useState<UserGrowthData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setLoading(true)
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      try {
        // Mock user role distribution data
        const userRoleDistribution: UserRoleData[] = [
          { role: "Guests", count: 15420, percentage: 68.5 },
          { role: "Hosts", count: 4830, percentage: 21.4 },
          { role: "Both", count: 2280, percentage: 10.1 },
        ]

        // Mock top performing properties data
        const topProperties: PropertyPerformanceData[] = [
          { id: "prop_001", name: "Luxury Villa Da Nang", bookings: 156, earnings: 45000000, location: "Da Nang, Vietnam" },
          { id: "prop_002", name: "Beachfront Resort Nha Trang", bookings: 142, earnings: 38500000, location: "Nha Trang, Vietnam" },
          { id: "prop_003", name: "Mountain Lodge Sapa", bookings: 128, earnings: 32000000, location: "Sapa, Vietnam" },
          { id: "prop_004", name: "City Center Apartment HCMC", bookings: 134, earnings: 41200000, location: "Ho Chi Minh City, Vietnam" },
          { id: "prop_005", name: "Riverside Hotel Hoi An", bookings: 119, earnings: 28900000, location: "Hoi An, Vietnam" },
          { id: "prop_006", name: "Penthouse Bangkok", bookings: 98, earnings: 52000000, location: "Bangkok, Thailand" },
          { id: "prop_007", name: "Beach Villa Phuket", bookings: 87, earnings: 48500000, location: "Phuket, Thailand" },
          { id: "prop_008", name: "Urban Loft Singapore", bookings: 76, earnings: 65000000, location: "Singapore" },
          { id: "prop_009", name: "Garden House Hanoi", bookings: 92, earnings: 25800000, location: "Hanoi, Vietnam" },
          { id: "prop_010", name: "Skyline Apartment KL", bookings: 68, earnings: 35600000, location: "Kuala Lumpur, Malaysia" },
        ]

        const mockStats: AdminStats = {
          totalUsers: {
            total: 22530,
            guests: 15420,
            hosts: 4830,
            both: 2280,
          },
          activeRooms: 8945,
          bidding: {
            daily: 234,
            weekly: 1456,
            monthly: 5890,
          },
          revenue: {
            totalRevenue: 125000000,
            platformFees: 12500000,
            growth: 15.8,
          },
          anomalyReports: [
            {
              id: "1",
              type: "reported-account",
              status: "pending",
              description: "Multiple fake reviews detected from this account",
              userName: "john_doe_123",
              userId: "user_001",
              createdAt: new Date("2024-01-15"),
              updatedAt: new Date("2024-01-15"),
            },
            {
              id: "2",
              type: "fraud-behavior",
              status: "resolved",
              description: "Suspicious bidding patterns detected",
              userName: "property_hunter",
              userId: "user_002",
              createdAt: new Date("2024-01-14"),
              updatedAt: new Date("2024-01-16"),
            },
            {
              id: "3",
              type: "suspicious-activity",
              status: "pending",
              description: "Unusual login patterns from different locations",
              userName: "travel_lover",
              userId: "user_003",
              createdAt: new Date("2024-01-13"),
              updatedAt: new Date("2024-01-13"),
            },
            {
              id: "4",
              type: "reported-account",
              status: "resolved",
              description: "Account reported for harassment by multiple users",
              userName: "bad_actor_99",
              userId: "user_004",
              createdAt: new Date("2024-01-12"),
              updatedAt: new Date("2024-01-17"),
            },
          ],
          userRoleDistribution,
          topProperties,
        }

        const mockRevenueData: RevenueData[] = [
          { month: "Jan", revenue: 8500000, platformFees: 850000 },
          { month: "Feb", revenue: 9200000, platformFees: 920000 },
          { month: "Mar", revenue: 10100000, platformFees: 1010000 },
          { month: "Apr", revenue: 11800000, platformFees: 1180000 },
          { month: "May", revenue: 13200000, platformFees: 1320000 },
          { month: "Jun", revenue: 12900000, platformFees: 1290000 },
        ]

        const mockUserGrowthData: UserGrowthData[] = [
          { month: "Jan", guests: 12500, hosts: 3200, total: 15700 },
          { month: "Feb", guests: 13200, hosts: 3450, total: 16650 },
          { month: "Mar", guests: 13800, hosts: 3680, total: 17480 },
          { month: "Apr", guests: 14500, hosts: 4100, total: 18600 },
          { month: "May", guests: 15100, hosts: 4520, total: 19620 },
          { month: "Jun", guests: 15420, hosts: 4830, total: 20250 },
        ]

        setStats(mockStats)
        setRevenueData(mockRevenueData)
        setUserGrowthData(mockUserGrowthData)
      } catch (error) {
        console.error("Error loading admin data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return {
    stats,
    revenueData,
    userGrowthData,
    loading,
  }
}
