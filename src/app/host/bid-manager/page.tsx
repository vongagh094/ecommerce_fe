"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Settings } from "lucide-react"
import type { ActiveAuction, PendingBid } from "@/types/host"

export default function BidManager() {
  const [activeAuctions, setActiveAuctions] = useState<ActiveAuction[]>([])
  const [pendingBids, setPendingBids] = useState<PendingBid[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockActiveAuctions: ActiveAuction[] = [
      {
        id: "1",
        property: {
          id: "1",
          title: "Ponta Delgada, Portugal",
          location: "Portugal",
          images: ["/placeholder.svg?height=200&width=300"],
        },
        currentBid: 2000000,
        remainingTime: { days: 3, hours: 12, minutes: 0 },
        status: "active",
      },
      {
        id: "2",
        property: {
          id: "2",
          title: "Ponta Delgada, Portugal",
          location: "Portugal",
          images: ["/placeholder.svg?height=200&width=300"],
        },
        currentBid: 2000000,
        remainingTime: { days: 3, hours: 12, minutes: 20 },
        status: "active",
      },
      {
        id: "3",
        property: {
          id: "3",
          title: "Apartment in Vietnam",
          location: "Vietnam",
          images: ["/placeholder.svg?height=200&width=300"],
        },
        currentBid: 2000000,
        remainingTime: { days: 3, hours: 12, minutes: 20 },
        status: "active",
      },
      {
        id: "4",
        property: {
          id: "4",
          title: "Flat in Warsaw, Poland",
          location: "Poland",
          images: ["/placeholder.svg?height=200&width=300"],
        },
        currentBid: 2000000,
        remainingTime: { days: 3, hours: 12, minutes: 0 },
        status: "active",
      },
    ]

    const mockPendingBids: PendingBid[] = [
      {
        id: "1",
        property: { id: "1", name: "Ponta Delgada, Portugal", location: "Portugal" },
        bidder: { id: "1", name: "Anonymous A", isAnonymous: true },
        bidAmount: 2000000,
        bidDate: "15/07/2025",
        status: "pending",
      },
      {
        id: "2",
        property: { id: "2", name: "Apartment in Vietnam", location: "Vietnam" },
        bidder: { id: "2", name: "Anonymous A", isAnonymous: true },
        bidAmount: 3000000,
        bidDate: "11/07/2025",
        status: "pending",
      },
      {
        id: "3",
        property: { id: "3", name: "Apartment in Vietnam", location: "Vietnam" },
        bidder: { id: "3", name: "Anonymous A", isAnonymous: true },
        bidAmount: 4000000,
        bidDate: "10/07/2025",
        status: "pending",
      },
      {
        id: "4",
        property: { id: "4", name: "Karthik Subramanian", location: "Coimbatore" },
        bidder: { id: "4", name: "Anonymous A", isAnonymous: true },
        bidAmount: 5000000,
        bidDate: "09/07/2025",
        status: "pending",
      },
    ]

    setTimeout(() => {
      setActiveAuctions(mockActiveAuctions)
      setPendingBids(mockPendingBids)
      setLoading(false)
    }, 1000)
  }, [])

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

  const formatTimeRemaining = (time: { days: number; hours: number; minutes: number }) => {
    return `${time.days}d ${time.hours}h ${time.minutes}m`
  }

  const handleBidAction = async (bidId: string, action: "verify" | "reject" | "extend") => {
    // Mock API call - replace with actual implementation
    console.log(`${action} bid ${bidId}`)

    // Update local state
    setPendingBids((prev) =>
      prev.map((bid) =>
        bid.id === bidId
          ? { ...bid, status: action === "verify" ? "verified" : action === "reject" ? "rejected" : "pending" }
          : bid,
      ),
    )
  }

  const filteredBids = pendingBids.filter(
    (bid) =>
      bid.property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bid.bidder.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Active Auctions Section */}
      <div className="mb-12">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Active auction(s)</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {activeAuctions.map((auction) => (
            <Card key={auction.id} className="border border-gray-200 rounded-2xl overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={auction.property.images[0] || "/placeholder.svg"}
                  alt={auction.property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">{auction.property.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{auction.property.location}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Bid:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(auction.currentBid)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Remaining time:</span>
                    <span className="text-sm text-cyan-600">{formatTimeRemaining(auction.remainingTime)}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full bg-transparent">
                  View details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pending Bid Actions Section */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">Pending bid action(s)</h2>

        {/* Search and Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">1 - 10 of 52</span>
            <div className="flex items-center space-x-1">
              {[...Array(6)].map((_, i) => (
                <Button key={i} variant="ghost" size="icon" className="w-8 h-8">
                  <Settings className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Bids Table */}
        <Card className="border border-gray-200 rounded-2xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">Property</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">Bidder</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">Bid amount</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">Bid date</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBids.map((bid) => (
                    <tr key={bid.id} className="border-b border-gray-100 last:border-b-0">
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-gray-900">{bid.property.name}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-gray-900">{bid.bidder.name}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-gray-900">{formatCurrency(bid.bidAmount)}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-gray-900">{bid.bidDate}</p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-100 text-green-700 hover:bg-green-200"
                            onClick={() => handleBidAction(bid.id, "verify")}
                          >
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-100 text-red-700 hover:bg-red-200"
                            onClick={() => handleBidAction(bid.id, "reject")}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="bg-orange-100 text-orange-700 hover:bg-orange-200"
                            onClick={() => handleBidAction(bid.id, "extend")}
                          >
                            Extend
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
