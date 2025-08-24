// components/bid/WinLossStatusFromAPI.tsx
"use client"

import React, {useState, useEffect, useCallback} from 'react'
import { useAuctionCalendarContext } from "@/contexts/auction-calendar-context"
import { Heart, X, Clock, Trophy, TrendingUp, TrendingDown } from 'lucide-react'
import SimpleCountdownTimer from "@/components/traveller/PollingCountDown";

// 🎯 NEW TYPES BASED ON UPDATED API RESPONSE
interface BidInfo {
    total_amount: number
    price_per_day: number
    check_in: string
    check_out: string
    nights: number
}

interface DailyBreakdown {
    date: string
    bid_price: number
    market_price: number | null
    status: 'WIN' | 'LOSE' | 'NO_DATA'
    difference: number | null
    difference_percentage: number | null
}

interface Summary {
    total_days: number
    win_days: number
    lose_days: number
    no_data_days: number
    win_rate: number
    overall_status: string
}

interface WinLossData {
    bid_id: string
    bid_info: BidInfo
    summary: Summary
    daily_breakdown: DailyBreakdown[]
}

interface WinLossResponse {
    success: boolean
    data?: WinLossData
}

interface WinLossStatusProps {
    user_id: number
    bid_id?: string  // Changed to use bid_id directly
    property_id?: number
    auction_id?: string
    className?: string
}

export function WinLossStatusFromAPI({
                                         user_id,
                                         bid_id,
                                         property_id,
                                         auction_id: overrideAuctionId,
                                         className = ""
                                     }: WinLossStatusProps) {

    const { selectedAuction } = useAuctionCalendarContext()
    const auctionId = overrideAuctionId || selectedAuction?.id

    const [data, setData] = useState<WinLossData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch win-loss status using new API
    const fetchWinLossStatus = async () => {

        setLoading(true)
        setError(null)

        try {
            // Use new API endpoint
            const url = `http://localhost:8000/winlose/user/${user_id}/auction/${auctionId}`

            console.log('🔍 Fetching win-loss status:', url)

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status}`)
            }

            const responseData: WinLossResponse = await response.json()

            if (responseData.success && responseData.data) {
                setData(responseData.data)
                console.log('✅ Win-loss data received:', responseData.data)
            } else {
                throw new Error('Invalid response format')
            }

        } catch (error) {
            console.error('❌ Error fetching win-loss status:', error)
            setError(error instanceof Error ? error.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchWinLossStatus()
    }, [bid_id])

    const handleRefresh = useCallback(() => {
        fetchWinLossStatus();
    }, [fetchWinLossStatus, bid_id])

    // Format currency
    const formatVND = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
        }).format(amount).replace("₫", "₫")
    }

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        })
    }

    // Get status styling - updated for new status values
    const getStatusStyle = (status: 'WIN' | 'LOSE' | 'NO_DATA') => {
        switch (status) {
            case 'WIN':
                return {
                    color: 'text-green-600',
                    bgColor: 'bg-green-50',
                    icon: <TrendingUp className="h-4 w-4 text-green-600" />,
                    dotColor: 'bg-green-500',
                    label: 'Winning'
                }
            case 'LOSE':
                return {
                    color: 'text-red-600',
                    bgColor: 'bg-red-50',
                    icon: <TrendingDown className="h-4 w-4 text-red-600" />,
                    dotColor: 'bg-red-500',
                    label: 'Losing'
                }
            case 'NO_DATA':
                return {
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50',
                    icon: <Clock className="h-4 w-4 text-gray-600" />,
                    dotColor: 'bg-gray-500',
                    label: 'No Data'
                }
            default:
                return {
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50',
                    icon: <Clock className="h-4 w-4 text-gray-600" />,
                    dotColor: 'bg-gray-500',
                    label: 'Unknown'
                }
        }
    }

    // Loading state
    if (loading) {
        return (
            <div className={`space-y-2 ${className}`}>
                <div className="text-sm font-medium text-gray-700 mb-3">Bid Status</div>
                {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse flex items-center justify-between py-2">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                            <div className="w-16 h-4 bg-gray-300 rounded"></div>
                        </div>
                        <div className="w-20 h-4 bg-gray-300 rounded"></div>
                    </div>
                ))}
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className={`text-center py-4 text-red-500 ${className}`}>
                <X className="h-6 w-6 mx-auto mb-2" />
                <p className="text-sm">{error}</p>
                <button
                    onClick={fetchWinLossStatus}
                    className="text-xs underline mt-2"
                >
                    Retry
                </button>
            </div>
        )
    }

    // No bid_id provided
    if (!bid_id) {
        return (
            <div className={`text-center py-4 text-gray-500 ${className}`}>
                <Clock className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Please provide a bid ID</p>
            </div>
        )
    }

    // No data found
    if (!data) {
        return (
            <div className={`text-center py-4 text-gray-500 ${className}`}>
                <Clock className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No bid data found</p>
            </div>
        )
    }

    const { bid_info, summary, daily_breakdown } = data

    return (
        <div className={`space-y-3 ${className}`}>
            {/* Header with summary */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Bid Status</h3>
                <SimpleCountdownTimer
                    interval={10000}
                    onTick={handleRefresh}
                    enabled={!loading}
                />
                <div className="text-right">
                    <div className="text-xs text-gray-500">Win Rate</div>
                    <div className={`text-sm font-bold ${
                        summary.win_rate >= 80 ? 'text-green-600' :
                            summary.win_rate >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                        {summary.win_rate.toFixed(1)}%
                    </div>
                </div>
            </div>

            {/* Bid info */}
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                <div className="flex justify-between">
                    <span>Your bid: {formatVND(bid_info.price_per_day)}/night</span>
                    <span>{summary.win_days}/{summary.total_days} nights winning</span>
                </div>
                <div className="flex justify-between mt-1">
                    <span>Total: {formatVND(bid_info.total_amount)}</span>
                    <span>{bid_info.nights} nights ({formatDate(bid_info.check_in)} - {formatDate(bid_info.check_out)})</span>
                </div>
            </div>

            {/* Date-by-date breakdown */}
            <div className="space-y-1">
                {daily_breakdown
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((day) => {
                        const style = getStatusStyle(day.status)

                        return (
                            <div
                                key={day.date}
                                className={`flex items-center justify-between py-2 px-2 rounded transition-colors hover:${style.bgColor}`}
                            >
                                {/* Date with status dot */}
                                <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${style.dotColor}`}></div>
                                    <span className="text-sm text-gray-700">{formatDate(day.date)}</span>
                                </div>

                                {/* Status and difference */}
                                <div className="flex items-center space-x-2">
                                    {/* Market price info */}
                                    {day.market_price !== null && (
                                        <span className="text-xs text-gray-500">
                                            vs {formatVND(day.market_price)}
                                        </span>
                                    )}

                                    {/* Difference */}
                                    {day.difference !== null && day.difference !== 0 && (
                                        <span className={`text-xs ${day.difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {day.difference > 0 ? '+' : ''}{formatVND(day.difference)}
                                        </span>
                                    )}

                                    {/* Status */}
                                    <span className={`text-sm font-medium ${style.color}`}>
                                        {style.label}
                                    </span>

                                    {/* Heart icon for winning */}
                                    <div className="w-4 h-4">
                                        {day.status === 'WIN' && (
                                            <Heart className="h-4 w-4 text-red-400" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
            </div>

            {/* Summary stats */}
            <div className="pt-2 border-t border-gray-100">
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div>
                        <div className="font-semibold text-green-600">{summary.win_days}</div>
                        <div className="text-gray-500">Win</div>
                    </div>
                    <div>
                        <div className="font-semibold text-red-600">{summary.lose_days}</div>
                        <div className="text-gray-500">Lose</div>
                    </div>
                    <div>
                        <div className="font-semibold text-gray-600">{summary.no_data_days}</div>
                        <div className="text-gray-500">No Data</div>
                    </div>
                    <div>
                        <div className="font-semibold text-blue-600">{summary.total_days}</div>
                        <div className="text-gray-500">Total</div>
                    </div>
                </div>

                {/* Overall status */}
                <div className="mt-2 text-center">
                    <span className={`text-sm font-medium px-2 py-1 rounded ${
                        summary.overall_status === 'WINNING' ? 'bg-green-100 text-green-700' :
                            summary.overall_status === 'LOSING' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                    }`}>
                        {summary.overall_status}
                    </span>
                </div>
            </div>

            {/* Refresh button */}
            <button
                onClick={fetchWinLossStatus}
                className="w-full mt-2 text-xs text-gray-500 hover:text-gray-700 py-1"
                disabled={loading}
            >
                {loading ? 'Refreshing...' : 'Refresh Status'}
            </button>
        </div>
    )
}

// Helper component for individual bid analysis
interface BidAnalysisCardProps {
    bid_id: string
    className?: string
}

export function BidAnalysisCard({ bid_id, className = "" }: BidAnalysisCardProps) {
    return (
        <div className={`bg-white rounded-lg border p-4 ${className}`}>
            <WinLossStatusFromAPI
                user_id={0} // Not needed for direct bid_id lookup
                bid_id={bid_id}
            />
        </div>
    )
}

// Hook for using win-loss data
export function useWinLossData(bid_id: string) {
    const [data, setData] = useState<WinLossData | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        if (!bid_id) return

        setLoading(true)
        setError(null)

        try {
            const response = await fetch(`/winlose/bid/${bid_id}`)
            if (!response.ok) throw new Error(`HTTP ${response.status}`)

            const result: WinLossResponse = await response.json()
            if (result.success && result.data) {
                setData(result.data)
            } else {
                throw new Error('Invalid response')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }, [bid_id])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    return { data, loading, error, refetch: fetchData }
}