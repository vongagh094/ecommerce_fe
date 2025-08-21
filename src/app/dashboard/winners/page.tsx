"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Trophy, Clock, Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WinnerNotificationCard } from "@/components/traveller/winner-notification-card"
import { usePaymentNotifications } from "@/hooks/use-payment-notifications"
import { auctionWinnerApi, winnerUtils } from "@/lib/api/auction-winners"
import { WinningBid } from "@/types/auction-winners"

type FilterType = 'all' | 'pending_payment' | 'paid' | 'expired'

export default function WinnersDashboardPage() {
  const router = useRouter()
  const [winningBids, setWinningBids] = useState<WinningBid[]>([])
  const [filteredBids, setFilteredBids] = useState<WinningBid[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  
  // Get user ID from auth context (you'll need to implement this)
  const userId = "current-user-id" // Replace with actual user ID from auth
  const { notifications, unreadCount } = usePaymentNotifications(userId)

  useEffect(() => {
    fetchWinningBids()
  }, [])

  useEffect(() => {
    filterBids()
  }, [winningBids, searchQuery, activeFilter])

  const fetchWinningBids = async () => {
    try {
      setIsLoading(true)
      const bids = await auctionWinnerApi.getWinningBids()
      setWinningBids(bids)
    } catch (error) {
      console.error('Failed to fetch winning bids:', error)
      setError('Failed to load your winning bids. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const filterBids = () => {
    let filtered = [...winningBids]

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(bid => {
        switch (activeFilter) {
          case 'pending_payment':
            return winnerUtils.hasPendingPayment(bid) && !winnerUtils.isPaymentExpired(bid.paymentDeadline)
          case 'paid':
            return bid.status === 'PAID'
          case 'expired':
            return winnerUtils.isPaymentExpired(bid.paymentDeadline)
          default:
            return true
        }
      })
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(bid =>
        bid.property.title.toLowerCase().includes(query) ||
        bid.property.city.toLowerCase().includes(query) ||
        bid.property.state.toLowerCase().includes(query)
      )
    }

    setFilteredBids(filtered)
  }

  const handlePaymentClick = (bid: WinningBid) => {
    if (bid.isPartialWin) {
      router.push(`/dashboard/winners/partial/${bid.auctionId}`)
    } else {
      router.push(`/dashboard/winners/${bid.auctionId}`)
    }
  }

  const handleViewDetails = (bid: WinningBid) => {
    router.push(`/property/${bid.property.id}`)
  }

  const getFilterCounts = () => {
    return {
      all: winningBids.length,
      pending_payment: winningBids.filter(bid => 
        winnerUtils.hasPendingPayment(bid) && !winnerUtils.isPaymentExpired(bid.paymentDeadline)
      ).length,
      paid: winningBids.filter(bid => bid.status === 'PAID').length,
      expired: winningBids.filter(bid => winnerUtils.isPaymentExpired(bid.paymentDeadline)).length
    }
  }

  const filterCounts = getFilterCounts()

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-800 mb-4">{error}</p>
            <Button onClick={fetchWinningBids} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Trophy className="h-8 w-8 mr-3 text-yellow-500" />
            Your Winning Bids
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your auction wins and complete payments
          </p>
        </div>
        
        {unreadCount > 0 && (
          <Badge variant="destructive" className="text-sm">
            {unreadCount} new notification{unreadCount > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Wins</p>
                <p className="text-2xl font-bold text-gray-900">{filterCounts.all}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Payment</p>
                <p className="text-2xl font-bold text-orange-600">{filterCounts.pending_payment}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-green-600">{filterCounts.paid}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-red-600">{filterCounts.expired}</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by property name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All', count: filterCounts.all },
            { key: 'pending_payment', label: 'Pending', count: filterCounts.pending_payment },
            { key: 'paid', label: 'Paid', count: filterCounts.paid },
            { key: 'expired', label: 'Expired', count: filterCounts.expired }
          ].map(filter => (
            <Button
              key={filter.key}
              variant={activeFilter === filter.key ? "default" : "outline"}
              onClick={() => setActiveFilter(filter.key as FilterType)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {filter.label}
              {filter.count > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {filter.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Winning Bids List */}
      {filteredBids.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {winningBids.length === 0 ? 'No Winning Bids Yet' : 'No Results Found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {winningBids.length === 0 
                ? 'Start bidding on properties to see your wins here!'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {winningBids.length === 0 && (
              <Button onClick={() => router.push('/search')}>
                Browse Properties
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredBids.map((bid) => (
            <WinnerNotificationCard
              key={bid.id}
              winningBid={bid}
              onPaymentClick={() => handlePaymentClick(bid)}
              onViewDetails={() => handleViewDetails(bid)}
            />
          ))}
        </div>
      )}

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{notification.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {notification.actionRequired && (
                    <Badge variant="destructive" className="ml-3">
                      Action Required
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}