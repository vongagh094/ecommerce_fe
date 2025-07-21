"use client"

import { Building2, TrendingUp, Calendar, DollarSign } from "lucide-react"
import type { DashboardStats } from "@/types/host"

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return `${(amount / 1000000).toFixed(1)}M đ`
  }

  const cards = [
    {
      title: "Total listing",
      value: stats.totalListing.toLocaleString(),
      icon: Building2,
      bgColor: "bg-teal-100",
      iconColor: "text-teal-600",
    },
    {
      title: "Total bid active",
      value: stats.totalBidActive.toLocaleString(),
      icon: TrendingUp,
      bgColor: "bg-teal-100",
      iconColor: "text-teal-600",
    },
    {
      title: "Total booking",
      value: stats.totalBooking.toLocaleString(),
      icon: Calendar,
      bgColor: "bg-teal-100",
      iconColor: "text-teal-600",
    },
    {
      title: "Sales",
      value: formatCurrency(stats.sales),
      icon: DollarSign,
      bgColor: "bg-teal-100",
      iconColor: "text-teal-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const IconComponent = card.icon
        return (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${card.bgColor}`}>
                <IconComponent className={`h-6 w-6 ${card.iconColor}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
