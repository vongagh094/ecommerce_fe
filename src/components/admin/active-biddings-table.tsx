"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Clock } from "lucide-react"
import type { ActiveBidding } from "@/types/admin"

interface ActiveBiddingsTableProps {
  biddings: ActiveBidding[]
}

export function ActiveBiddingsTable({ biddings }: ActiveBiddingsTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Active Auctions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {biddings.map((bidding) => (
            <div
              key={bidding.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{bidding.propertyTitle}</h4>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span>
                    Current bid:{" "}
                    <span className="font-semibold text-green-600">{formatCurrency(bidding.currentBid)}</span>
                  </span>
                  <span>
                    Bidders: <span className="font-semibold">{bidding.bidderCount}</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <Badge variant={bidding.status === "closing-soon" ? "destructive" : "secondary"} className="mb-1">
                    {bidding.status === "closing-soon" ? "Closing Soon" : "Active"}
                  </Badge>
                  <div className="text-sm font-medium text-gray-900">{bidding.timeRemaining}</div>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
