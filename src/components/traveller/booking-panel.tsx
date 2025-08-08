"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/biding/card"
import { Button } from "@/components/ui/biding/button"
import { Input } from "@/components/ui/biding/input"
import { Label } from "@/components/ui/biding/label"
import { Switch } from "@/components/ui/biding/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/biding/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/biding/dialog"
import { Progress } from "@/components/ui/biding/progress"
import { useToast } from "@/hooks/use-toast"
import {
    CalendarDays,
    DollarSign,
    TrendingDown,
    Trophy,
    Users,
    BarChart3,
    Percent,
    Eye,
    Flame,
    Shield,
    MessageCircle,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Calculator,
    Clock,
    Zap,
} from "lucide-react"
import {format, isSameDay } from "date-fns"

interface DayData {
    date: Date
    highestBid: number
    activeBids: number
    minimumToWin: number
    basePrice: number
    demandLevel: "low" | "moderate" | "high"
    successRate: number
    isAvailable: boolean
    isBooked: boolean
}

// interface TripSuggestion {
//     id: string
//     dateRange: string
//     startDate: Date
//     endDate: Date
//     nights: number
//     avgBidPerNight: number
//     totalEstimate: number
//     successRate: number
//     demandLevel: "low" | "moderate" | "high"
//     savings: number
// }

interface DateRangeStatus {
    date: Date
    isWinning: boolean
    currentBid: number
    recommendedBid: number
    isBooked: boolean
}

type HostPolicy = "total_revenue" | "per_night"

export function BookingPanel() {
    const { toast } = useToast()

    // Property and host settings
    const [hostPolicy, setHostPolicy] = useState<HostPolicy>("total_revenue")

    // Calendar and bidding state
    const [selectedDates, setSelectedDates] = useState<Date[]>([])
    const [calendarData, setCalendarData] = useState<DayData[]>([])
    const [dateRangeStatus, setDateRangeStatus] = useState<DateRangeStatus[]>([])

    // Modal states
    const [showBookedDateModal, setShowBookedDateModal] = useState(false)
    const [pendingDateSelection, setPendingDateSelection] = useState<Date[]>([])

    // Bidding state
    const [totalBid, setTotalBid] = useState("")
    const [allowPartial, setAllowPartial] = useState(true)


    const selectedNights = selectedDates.length
    const bidPerNight = totalBid && selectedNights > 0 ? Math.round(Number.parseFloat(totalBid) / selectedNights) : 0

    // Calculate win probability and suggested bid
    const calculateWinMetrics = () => {
        if (selectedDates.length === 0) return { winProbability: 0, suggestedTotalBid: 0, currentMarketRate: 0 }

        const availableDates = dateRangeStatus.filter((status) => !status.isBooked)
        const currentMarketRate = Math.round(
            availableDates.reduce((sum, status) => {
                const dayData = calendarData.find((d) => isSameDay(d.date, status.date))
                return sum + (dayData?.highestBid || 0)
            }, 0) / Math.max(availableDates.length, 1),
        )

        let suggestedTotalBid = 0
        let winProbability = 0

        if (hostPolicy === "total_revenue") {
            // For total revenue policy, calculate based on total bid competitiveness
            const competitorTotalBids = [800, 1200, 600, 900, 1100]
            const avgCompetitorBid = competitorTotalBids.reduce((a, b) => a + b, 0) / competitorTotalBids.length
            suggestedTotalBid = Math.round(avgCompetitorBid * 1.15) // 15% above average to win

            const currentTotalBid = Number.parseFloat(totalBid) || 0
            if (currentTotalBid > avgCompetitorBid * 1.1) winProbability = 85
            else if (currentTotalBid > avgCompetitorBid) winProbability = 65
            else if (currentTotalBid > avgCompetitorBid * 0.8) winProbability = 40
            else winProbability = 15
        } else {
            // For per-night policy, calculate based on individual night competitiveness
            const totalRecommended = availableDates.reduce((sum, status) => sum + status.recommendedBid, 0)
            suggestedTotalBid = totalRecommended

            const winningNights = dateRangeStatus.filter((status) => status.isWinning && !status.isBooked).length
            winProbability = Math.round((winningNights / Math.max(availableDates.length, 1)) * 100)
        }

        return { winProbability, suggestedTotalBid, currentMarketRate }
    }

    const { winProbability, suggestedTotalBid, currentMarketRate } = calculateWinMetrics()
    const handleBookedDateConfirmation = (acceptPartial: boolean) => {
        if (acceptPartial) {
            // Remove booked dates from selection
            const availableDates = pendingDateSelection.filter((date) => {
                const dayData = calendarData.find((d) => isSameDay(d.date, date))
                return !dayData?.isBooked
            })
            setSelectedDates(availableDates)
            setAllowPartial(true)
            toast({
                title: "Partial Booking Enabled",
                description: `Selected ${availableDates.length} available nights, skipping booked dates`,
            })
        } else {
            // Don't select the range
            toast({
                title: "Selection Cancelled",
                description: "Please choose a different date range without booked nights",
                variant: "destructive",
            })
        }
        setShowBookedDateModal(false)
        setPendingDateSelection([])
    }
    const handleSubmitBid = () => {
        if (!selectedDates.length || !totalBid) {
            toast({
                title: "Missing Information",
                description: "Please select dates and enter your bid amount",
                variant: "destructive",
            })
            return
        }

        const bookedDatesInSelection = dateRangeStatus.filter((status) => status.isBooked).length
        if (bookedDatesInSelection > 0 && !allowPartial) {
            toast({
                title: "Booked Dates in Selection",
                description: "Enable partial booking or choose different dates",
                variant: "destructive",
            })
            return
        }

        toast({
            title: "Bid Submitted Successfully! 🎉",
            description: `Your bid of $${totalBid} for ${selectedNights} nights has been submitted`,
        })
    }

    const winningNights = dateRangeStatus.filter((status) => status.isWinning && !status.isBooked).length
    const losingNights = dateRangeStatus.filter((status) => !status.isWinning && !status.isBooked).length
    const bookedNights = dateRangeStatus.filter((status) => status.isBooked).length

    return (
        <div className="min-h-screen bg-white">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    {/* Sticky Bidding Sidebar */}
                    <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                {/* Main Bidding Panel */}
                                <Card className="border-2 border-purple-200 shadow-lg">
                                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="flex items-center text-lg">
                                                    <Zap className="h-5 w-5 mr-2 text-purple-600" />
                                                    Smart Bidding
                                                </CardTitle>
                                                <CardDescription>
                                                    Optimized for {hostPolicy === "total_revenue" ? "total revenue" : "per-night"} policy
                                                </CardDescription>
                                            </div>
                                            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                                                <Flame className="h-3 w-3 mr-1" />
                                                Live
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-6">
                                        {/* Selected Dates Display with Progress */}
                                        {selectedDates.length > 0 ? (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-semibold text-blue-900">{selectedNights} nights selected</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setSelectedDates([])}
                                                            className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
                                                        >
                                                            Clear
                                                        </Button>
                                                    </div>
                                                    <div className="text-sm text-blue-700 mb-3">
                                                        {format(selectedDates[0], "MMM d")} -{" "}
                                                        {format(selectedDates[selectedDates.length - 1], "MMM d")}
                                                    </div>

                                                    {/* Progress Visualization */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span>Bid Status Progress</span>
                                                            <span>
                                {winningNights}/{selectedNights - bookedNights} winning
                              </span>
                                                        </div>
                                                        <Progress
                                                            value={(winningNights / Math.max(selectedNights - bookedNights, 1)) * 100}
                                                            className="h-2"
                                                        />
                                                        <div className="flex items-center justify-between text-xs text-blue-600">
                              <span>
                                {winningNights > 0 && <span className="text-green-600">✓ {winningNights} winning</span>}
                              </span>
                                                            <span>
                                {losingNights > 0 && <span className="text-red-600">✗ {losingNights} losing</span>}
                              </span>
                                                            <span>
                                {bookedNights > 0 && <span className="text-gray-600">⊘ {bookedNights} booked</span>}
                              </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Date Range Status Details */}
                                                {dateRangeStatus.length > 0 && (
                                                    <div className="space-y-2">
                                                        <h4 className="font-medium text-sm">Night-by-Night Status</h4>
                                                        <div className="max-h-32 overflow-y-auto space-y-1">
                                                            {dateRangeStatus.slice(0, 7).map((status, index) => (
                                                                <div
                                                                    key={index}
                                                                    className={`flex items-center justify-between p-2 rounded text-xs ${
                                                                        status.isBooked
                                                                            ? "bg-gray-100 text-gray-600"
                                                                            : status.isWinning
                                                                                ? "bg-green-50 text-green-800"
                                                                                : "bg-red-50 text-red-800"
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center space-x-2">
                                                                        {status.isBooked ? (
                                                                            <XCircle className="h-3 w-3" />
                                                                        ) : status.isWinning ? (
                                                                            <CheckCircle className="h-3 w-3" />
                                                                        ) : (
                                                                            <XCircle className="h-3 w-3" />
                                                                        )}
                                                                        <span>{format(status.date, "MMM d")}</span>
                                                                    </div>
                                                                    <span className="font-medium">
                                    {status.isBooked ? "Booked" : status.isWinning ? "Winning" : "Losing"}
                                  </span>
                                                                </div>
                                                            ))}
                                                            {dateRangeStatus.length > 7 && (
                                                                <div className="text-xs text-gray-500 text-center">
                                                                    +{dateRangeStatus.length - 7} more nights
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 text-gray-500">
                                                <CalendarDays className="h-8 w-8 mx-auto mb-2" />
                                                <p className="text-sm">Select dates above to start bidding</p>
                                                <p className="text-xs">Or choose from our smart suggestions</p>
                                            </div>
                                        )}

                                        {/* Bid Input and Calculations */}
                                        {selectedDates.length > 0 && (
                                            <>
                                                <div className="space-y-3">
                                                    <Label htmlFor="totalBid" className="text-sm font-medium">
                                                        Your Total Bid
                                                    </Label>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                        <Input
                                                            id="totalBid"
                                                            type="number"
                                                            placeholder="1500"
                                                            className="pl-10 text-lg font-semibold"
                                                            value={totalBid}
                                                            onChange={(e) => setTotalBid(e.target.value)}
                                                        />
                                                    </div>
                                                    {bidPerNight > 0 && (
                                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                            <div className="p-2 bg-green-50 rounded border border-green-200">
                                                                <div className="text-green-800">Per night</div>
                                                                <div className="font-bold text-green-600">${bidPerNight}</div>
                                                            </div>
                                                            <div className="p-2 bg-blue-50 rounded border border-blue-200">
                                                                <div className="text-blue-800">Market avg</div>
                                                                <div className="font-bold text-blue-600">${currentMarketRate}</div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Win Probability and Suggestions */}
                                                {bidPerNight > 0 && (
                                                    <div className="space-y-3">
                                                        <Alert className="border-blue-200 bg-blue-50">
                                                            <Percent className="h-4 w-4 text-blue-600" />
                                                            <AlertDescription className="text-blue-800">
                                                                <strong>Win probability: {winProbability}%</strong> based on current market data
                                                            </AlertDescription>
                                                        </Alert>

                                                        {suggestedTotalBid > Number.parseFloat(totalBid || "0") && (
                                                            <Alert className="border-orange-200 bg-orange-50">
                                                                <Calculator className="h-4 w-4 text-orange-600" />
                                                                <AlertDescription className="text-orange-800">
                                                                    <strong>Suggested bid: ${suggestedTotalBid}</strong> to increase win chances to 85%
                                                                    <Button
                                                                        variant="link"
                                                                        size="sm"
                                                                        className="p-0 h-auto ml-2 text-orange-700"
                                                                        onClick={() => setTotalBid(suggestedTotalBid.toString())}
                                                                    >
                                                                        Apply
                                                                    </Button>
                                                                </AlertDescription>
                                                            </Alert>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Booked Dates Warning */}
                                                {bookedNights > 0 && (
                                                    <Alert className="border-red-200 bg-red-50">
                                                        <AlertTriangle className="h-4 w-4 text-red-600" />
                                                        <AlertDescription className="text-red-800">
                                                            <strong>{bookedNights} night(s) in your selection are already booked.</strong> Enable
                                                            partial booking to bid on available nights only.
                                                        </AlertDescription>
                                                    </Alert>
                                                )}

                                                {/* Partial Booking Toggle */}
                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center space-x-2">
                                                        <Users className="h-4 w-4 text-gray-600" />
                                                        <div>
                                                            <Label className="text-sm font-medium">Allow Partial Booking</Label>
                                                            <p className="text-xs text-gray-600">Accept partial stays if not all nights win</p>
                                                        </div>
                                                    </div>
                                                    <Switch checked={allowPartial} onCheckedChange={setAllowPartial} />
                                                </div>

                                                {/* Submit Button */}
                                                <Button
                                                    onClick={handleSubmitBid}
                                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                                    size="lg"
                                                    disabled={bookedNights > 0 && !allowPartial}
                                                >
                                                    <Trophy className="h-4 w-4 mr-2" />
                                                    Submit Bid
                                                </Button>

                                                <div className="text-center">
                                                    <p className="text-xs text-gray-600">
                                                        <Shield className="h-3 w-3 inline mr-1" />
                                                        You won't be charged until your bid wins
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Market Insights */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center">
                                            <BarChart3 className="h-5 w-5 mr-2" />
                                            Market Insights
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                <div className="text-xl font-bold text-blue-600">$245</div>
                                                <div className="text-xs text-blue-800">Avg. winning bid</div>
                                            </div>
                                            <div className="text-center p-3 bg-green-50 rounded-lg">
                                                <div className="text-xl font-bold text-green-600">82%</div>
                                                <div className="text-xs text-green-800">Success rate</div>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center space-x-2">
                                                <TrendingDown className="h-4 w-4 text-green-600" />
                                                <span>Best deals: March 15-18 (30% below avg)</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Clock className="h-4 w-4 text-blue-600" />
                                                <span>Peak season: Dec-Feb (+40% avg bid)</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Eye className="h-4 w-4 text-purple-600" />
                                                <span>12 people viewed this in the last hour</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Host Info */}
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                                                JD
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">Hosted by John</h4>
                                                <p className="text-sm text-gray-600">Superhost · 3 years hosting</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" className="w-full bg-transparent">
                                            <MessageCircle className="h-4 w-4 mr-2" />
                                            Contact Host
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                </div>
                {/* Booked Date Modal */}
                <Dialog open={showBookedDateModal} onOpenChange={setShowBookedDateModal}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center">
                                <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                                Booked Dates in Selection
                            </DialogTitle>
                            <DialogDescription>
                                Your selected date range includes some nights that are already booked. What would you like to do?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                <h4 className="font-medium text-orange-900 mb-2">Selected Range:</h4>
                                <p className="text-sm text-orange-800">
                                    {pendingDateSelection.length > 0 &&
                                        `${format(pendingDateSelection[0], "MMM d")} - ${format(
                                            pendingDateSelection[pendingDateSelection.length - 1],
                                            "MMM d",
                                        )}`}
                                </p>
                                <p className="text-xs text-orange-700 mt-1">
                                    {
                                        pendingDateSelection.filter((date) => {
                                            const dayData = calendarData.find((d) => isSameDay(d.date, date))
                                            return dayData?.isBooked
                                        }).length
                                    }{" "}
                                    night(s) are already booked
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" onClick={() => handleBookedDateConfirmation(true)} className="bg-transparent">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Accept Partial
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleBookedDateConfirmation(false)}
                                    className="bg-transparent"
                                >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Choose Different Dates
                                </Button>
                            </div>
                            <p className="text-xs text-gray-600 text-center">
                                Accepting partial booking will automatically skip booked nights and enable partial booking for your bid.
                            </p>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
    )
}