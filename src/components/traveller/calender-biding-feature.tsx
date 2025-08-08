"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/biding/card"
import { Button } from "@/components/ui/biding/button"
import { Label } from "@/components/ui/biding/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/biding/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/biding/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/biding/tooltip"
import { useToast } from "@/hooks/use-toast"
import {
    ChevronLeft,
    ChevronRight,
    Target,
    Sparkles,
    CalendarIcon,
    ChevronDown,
    ChevronUp,
} from "lucide-react"
import { addDays, format, isSameDay, eachDayOfInterval } from "date-fns"


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

interface TripSuggestion {
    id: string
    dateRange: string
    startDate: Date
    endDate: Date
    nights: number
    avgBidPerNight: number
    totalEstimate: number
    successRate: number
    demandLevel: "low" | "moderate" | "high"
    savings: number
}
interface DateRangeStatus {
    date: Date
    isWinning: boolean
    currentBid: number
    recommendedBid: number
    isBooked: boolean
}

type HostPolicy = "total_revenue" | "per_night"


export function CalenderBidingFeature() {
    const { toast } = useToast()

    // Property and host settings
    const [hostPolicy, setHostPolicy] = useState<HostPolicy>("total_revenue")

    // Calendar and bidding state
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDates, setSelectedDates] = useState<Date[]>([])
    const [calendarData, setCalendarData] = useState<DayData[]>([])
    const [showBiddingCalendar, setShowBiddingCalendar] = useState(false)

    // Modal states
    const [showBookedDateModal, setShowBookedDateModal] = useState(false)
    const [pendingDateSelection, setPendingDateSelection] = useState<Date[]>([])

    // Filters and preferences
    const [maxBudget, setMaxBudget] = useState([300])
    const [demandFilter, setDemandFilter] = useState("all")

    // Bidding state
    const [totalBid, setTotalBid] = useState("")
    const [tripSuggestions, setTripSuggestions] = useState<TripSuggestion[]>([])

    // Calculate win probability and suggested bid

    const getDemandColor = (level: "low" | "moderate" | "high") => {
        switch (level) {
            case "low":
                return "bg-green-100 text-green-800 border-green-200"
            case "moderate":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case "high":
                return "bg-red-100 text-red-800 border-red-200"
        }
    }

    const getDemandBgColor = (level: "low" | "moderate" | "high") => {
        switch (level) {
            case "low":
                return "bg-green-50 hover:bg-green-100 border-green-200"
            case "moderate":
                return "bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
            case "high":
                return "bg-red-50 hover:bg-red-100 border-red-200"
        }
    }

    const handleDateSelect = (date: Date) => {
        let newRange: Date[] = []

        if (selectedDates.length === 0) {
            newRange = [date]
        } else if (selectedDates.length === 1) {
            const start = selectedDates[0]
            if (date > start) {
                newRange = eachDayOfInterval({ start, end: date })
            } else {
                newRange = [date]
            }
        } else {
            newRange = [date]
        }

        // Check if there are booked dates in the range
        const hasBookedDates = newRange.some((rangeDate) => {
            const dayData = calendarData.find((d) => isSameDay(d.date, rangeDate))
            return dayData?.isBooked
        })

        if (hasBookedDates && newRange.length > 1) {
            setPendingDateSelection(newRange)
            setShowBookedDateModal(true)
        } else {
            setSelectedDates(newRange)
        }
    }

    const selectSuggestion = (suggestion: TripSuggestion) => {
        const range = eachDayOfInterval({ start: suggestion.startDate, end: suggestion.endDate })
        setSelectedDates(range)
        setTotalBid(suggestion.totalEstimate.toString())
        setShowBiddingCalendar(true)
        toast({
            title: "Trip Selected! 🎯",
            description: `Selected ${suggestion.dateRange} for ${suggestion.nights} nights`,
        })
    }
    return (
    <TooltipProvider>
        <div className="flex flex-col gap-4">
            {/* Smart Trip Suggestions */}
            <Card className="border-2 border-purple-100 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                        Smart Trip Suggestions
                    </CardTitle>
                    <CardDescription>Optimized for the host's {hostPolicy.replace("_", " ")} policy</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tripSuggestions.map((suggestion) => (
                            <div
                                key={suggestion.id}
                                className="p-4 bg-white border rounded-lg hover:shadow-md transition-all cursor-pointer group"
                                onClick={() => selectSuggestion(suggestion)}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="font-semibold text-lg">{suggestion.dateRange}</div>
                                    <Badge className={getDemandColor(suggestion.demandLevel)} variant="outline">
                                        {suggestion.demandLevel} demand
                                    </Badge>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">{suggestion.nights} nights</span>
                                        <span className="font-bold text-green-600 text-lg">${suggestion.avgBidPerNight}/night</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Win probability</span>
                                        <span className="font-semibold text-blue-600">
                              {Math.round(suggestion.successRate * 100)}%
                            </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Total estimate</span>
                                        <span className="font-bold text-lg">${suggestion.totalEstimate}</span>
                                    </div>
                                    {suggestion.savings > 0 && (
                                        <div className="flex justify-between items-center text-green-600">
                                            <span className="font-medium">You save</span>
                                            <span className="font-bold">${suggestion.savings}</span>
                                        </div>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-3 group-hover:bg-purple-50 group-hover:border-purple-200 bg-transparent"
                                >
                                    <Target className="h-4 w-4 mr-1" />
                                    Select This Trip
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Smart Bidding Calendar */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center">
                                <CalendarIcon className="h-5 w-5 mr-2" />
                                Smart Bidding Calendar
                            </CardTitle>
                            <CardDescription>Find the best dates with color-coded demand levels</CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowBiddingCalendar(!showBiddingCalendar)}
                            className="bg-transparent"
                        >
                            {showBiddingCalendar ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            {showBiddingCalendar ? "Hide" : "Show"} Calendar
                        </Button>
                    </div>
                </CardHeader>
                {showBiddingCalendar && (
                    <CardContent className="space-y-6">
                        {/* Quick Filters */}
                        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <Label className="text-sm font-medium">Max Budget:</Label>
                                <div className="w-32">
                                    <Slider
                                        value={maxBudget}
                                        onValueChange={setMaxBudget}
                                        max={500}
                                        min={100}
                                        step={25}
                                        className="w-full"
                                    />
                                </div>
                                <span className="text-sm font-medium">${maxBudget[0]}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Label className="text-sm font-medium">Show:</Label>
                                <Select value={demandFilter} onValueChange={setDemandFilter}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All dates</SelectItem>
                                        <SelectItem value="low">Low demand</SelectItem>
                                        <SelectItem value="moderate">Moderate</SelectItem>
                                        <SelectItem value="high">High demand</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Calendar Navigation */}
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h3>
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addDays(currentMonth, -30))}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setCurrentMonth(addDays(currentMonth, 30))}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-7 gap-2">
                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                                {calendarData
                                    .filter((day) => demandFilter === "all" || day.demandLevel === demandFilter)
                                    .filter((day) => day.highestBid <= maxBudget[0])
                                    .map((day) => {
                                        const isSelected = selectedDates.some((date) => isSameDay(date, day.date))
                                        const isInRange =
                                            selectedDates.length > 1 &&
                                            day.date >= selectedDates[0] &&
                                            day.date <= selectedDates[selectedDates.length - 1]

                                        return (
                                            <Tooltip key={day.date.getTime()}>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        className={`
                                      relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
                                      ${
                                                            day.isBooked ? "bg-gray-100 border-gray-300" : getDemandBgColor(day.demandLevel)
                                                        }
                                      ${
                                                            isSelected
                                                                ? "border-purple-500 ring-2 ring-purple-200 scale-105"
                                                                : isInRange
                                                                    ? "border-purple-300 bg-purple-50"
                                                                    : "border-transparent"
                                                        }
                                      ${day.isBooked ? "cursor-not-allowed" : "hover:scale-105"}
                                    `}
                                                        onClick={() => !day.isBooked && handleDateSelect(day.date)}
                                                    >
                                                        <div className="text-center">
                                                            <div className="text-sm font-medium">{format(day.date, "d")}</div>
                                                            {day.isBooked ? (
                                                                <div className="text-xs text-gray-500">Booked</div>
                                                            ) : (
                                                                <>
                                                                    <div className="text-xs font-bold text-green-600">${day.highestBid}</div>
                                                                    <div className="text-xs text-gray-500">{day.activeBids} bids</div>
                                                                </>
                                                            )}
                                                        </div>
                                                        {!day.isBooked && (
                                                            <div
                                                                className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                                                                    day.demandLevel === "low"
                                                                        ? "bg-green-400"
                                                                        : day.demandLevel === "moderate"
                                                                            ? "bg-yellow-400"
                                                                            : "bg-red-400"
                                                                }`}
                                                            />
                                                        )}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <div className="text-sm space-y-1">
                                                        <div className="font-medium">{format(day.date, "MMM d, yyyy")}</div>
                                                        {day.isBooked ? (
                                                            <div className="text-red-600">This date is already booked</div>
                                                        ) : (
                                                            <>
                                                                <div>Current highest: ${day.highestBid}</div>
                                                                <div>Min to win: ${day.minimumToWin}</div>
                                                                <div>Active bids: {day.activeBids}</div>
                                                                <div>Win rate: {Math.round(day.successRate * 100)}%</div>
                                                                <Badge className={getDemandColor(day.demandLevel)} variant="outline">
                                                                    {day.demandLevel} demand
                                                                </Badge>
                                                            </>
                                                        )}
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        )
                                    })}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-center space-x-6 pt-4 border-t">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                <span className="text-sm">Low demand</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                <span className="text-sm">Moderate</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                <span className="text-sm">High demand</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                <span className="text-sm">Booked</span>
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    </TooltipProvider>
    )
}