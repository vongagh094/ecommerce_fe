import { Card, CardContent } from "@/components/ui/card"
import type { HostDashboardStats } from "@/types/host"

interface StatsCardsProps {
  stats: HostDashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("₫", "đ")
  }

  const statItems = [
    {
      title: "Total listing",
      value: stats.totalListing.toString(),
      icon: "🏠",
      color: "bg-cyan-100 text-cyan-600",
    },
    {
      title: "Total bid active",
      value: stats.totalBidActive.toString(),
      icon: "✅",
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Total booking",
      value: stats.totalBooking.toString(),
      icon: "⚡",
      color: "bg-cyan-100 text-cyan-600",
    },
    {
      title: "Sales",
      value: formatCurrency(stats.sales),
      icon: "💰",
      color: "bg-cyan-100 text-cyan-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {statItems.map((item, index) => (
        <Card key={index} className="border border-gray-200 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center text-lg`}>
                {item.icon}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{item.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
