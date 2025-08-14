"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/biding/card"
import { Button } from "@/components/ui/biding/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/biding/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/biding/dialog"
import { useToast } from "@/hooks/use-toast"
import {
    ChevronLeft,
    ChevronRight,
    Target,
    Sparkles,
    CalendarIcon,
    ChevronDown,
    ChevronUp,
    AlertTriangle,
    CheckCircle,
    XCircle,
} from "lucide-react"
import { addMonths, subMonths, format, isSameDay, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns"
import {useCalendarContext} from "@/contexts/calender-context";

interface DayData {
    date: Date
    highest_bid: number
    active_bids: number
    minimum_to_win: number
    base_price: number
    demand_level: "low" | "moderate" | "high"
    success_rate: number
    is_available: boolean
    is_booked: boolean
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

interface CalendarBidingProps {
    property_id: number
}

export function CalenderBidingFeature({ property_id }: CalendarBidingProps) {
    const { toast } = useToast()

    // Use shared booking state
    const {
        selectedDates,
        setSelectedDates,
        totalBid,
        setTotalBid,
        handleDateSelect,
        showBookedDateModal,
        setShowBookedDateModal,
        pendingDateSelection,
        handleBookedDateConfirmation
    } = useCalendarContext()

    // Local state for calendar
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [showBiddingCalendar, setShowBiddingCalendar] = useState(false)
    const [loading, setLoading] = useState(false)
    const [calendarData, setCalendarData] = useState<DayData[]>([])
    const [tripSuggestions, setTripSuggestions] = useState<TripSuggestion[]>([])

    // Fetch calendar data from API
    const fetchCalendarData = async (month: number, year: number) => {
        setLoading(true)
        try {
            const response = await fetch(
                `http://localhost:8000/calendar/properties/${property_id}/calendar?month=${month}&year=${year}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
            })

            if (!response.ok) {
                throw new Error('Failed to fetch calendar data')
            }

            const responseData = await response.json()

            // Convert date strings to Date objects
            const calendarDataWithDates = responseData.days.map((day: any) => ({
                ...day,
                date: new Date(day.date)
            }))

            setCalendarData(calendarDataWithDates)

            // Fetch trip suggestions nếu API có
            if (responseData.trip_suggestions) {
                setTripSuggestions(responseData.trip_suggestions)
            }

        } catch (error) {
            console.error('Error fetching calendar data:', error)
            toast({
                title: "Error",
                description: "Failed to load calendar data",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    //
    const generateCalendarGrid = () => {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()

        // Ngày đầu tiên và cuối cùng của tháng
        const firstDayOfMonth = new Date(year, month, 1)
        const lastDayOfMonth = new Date(year, month + 1, 0)

        // Ngày đầu tiên của tuần chứa ngày đầu tháng (Chủ nhật = 0)
        const startingDayOfWeek = firstDayOfMonth.getDay()

        // Tổng số ngày trong tháng
        const daysInMonth = lastDayOfMonth.getDate()

        const calendarGrid = []

        // Thêm các ô trống cho những ngày trước ngày đầu tiên của tháng
        for (let i = 0; i < startingDayOfWeek; i++) {
            calendarGrid.push(null)
        }

        // Thêm tất cả các ngày trong tháng
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day)

            // Tìm dữ liệu từ API cho ngày này
            const dayData = calendarData.find(d => isSameDay(d.date, date))

            if (dayData) {
                calendarGrid.push(dayData)
            } else {
                // Nếu không có dữ liệu từ API, tạo dữ liệu mặc định
                calendarGrid.push({
                    date: date,
                    highest_bid: 0,
                    active_bids: 0,
                    minimum_to_win: 0,
                    base_price: 0,
                    demand_level: "low" as const,
                    success_rate: 0,
                    is_available: false,
                    is_booked: false,
                })
            }
        }

        return calendarGrid
    }

    // Load calendar data when the month changes
    useEffect(() => {
        const month = currentMonth.getMonth() + 1
        const year = currentMonth.getFullYear()
        fetchCalendarData(month, year)
    }, [currentMonth, property_id])

    const goToPreviousMonth = () => {
        setCurrentMonth(prevMonth => subMonths(prevMonth, 1))
    }

    const goToNextMonth = () => {
        setCurrentMonth(prevMonth => addMonths(prevMonth, 1))
    }

    const formatVND = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount).replace("₫", "₫")
    }

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

    const handleDateClick = (date: Date) => {
        const result = handleDateSelect(date, calendarData)
        // Modal sẽ được hiển thị tự động bởi hook nếu có booked dates
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

    const handleBookedConfirmation = (acceptPartial: boolean) => {
        const result = handleBookedDateConfirmation(acceptPartial, calendarData)

        if (result.success && acceptPartial) {
            toast({
                title: "Partial Booking Enabled",
                description: `Selected ${result.selectedCount} available nights, skipping booked dates`,
            })
        } else if (!result.success) {
            toast({
                title: "Selection Cancelled",
                description: "Please choose a different date range without booked nights",
                variant: "destructive",
            })
        }
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
                        <CardDescription>Optimized suggestions for property {property_id}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="p-4 bg-white border rounded-lg animate-pulse">
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
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
                                                <span className="font-bold text-green-600 text-lg">
                                                    {formatVND(suggestion.avgBidPerNight)}/night
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Win probability</span>
                                                <span className="font-semibold text-blue-600">
                                                    {Math.round(suggestion.successRate * 100)}%
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Total estimate</span>
                                                <span className="font-bold text-lg">{formatVND(suggestion.totalEstimate)}</span>
                                            </div>
                                            {suggestion.savings > 0 && (
                                                <div className="flex justify-between items-center text-green-600">
                                                    <span className="font-medium">You save</span>
                                                    <span className="font-bold">{formatVND(suggestion.savings)}</span>
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
                        )}
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
                                <CardDescription>Click dates to select your stay period</CardDescription>
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
                            {/* Calendar Navigation */}
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h3>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={goToPreviousMonth}
                                        disabled={loading}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={goToNextMonth}
                                        disabled={loading}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                                    <p className="text-gray-500 mt-2">Loading calendar data...</p>
                                </div>
                            ) : (
                                <>
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
                                            {generateCalendarGrid().map((day, index) => {
                                                if (!day) {
                                                    // Ô trống cho những ngày không thuộc tháng hiện tại
                                                    return <div key={index} className="p-3"></div>
                                                }

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
                                                                    day.is_booked ? "bg-gray-100 border-gray-300" : getDemandBgColor(day.demand_level)
                                                                }
                            ${
                                                                    isSelected
                                                                        ? "border-purple-500 ring-2 ring-purple-200 scale-105"
                                                                        : isInRange
                                                                            ? "border-purple-300 bg-purple-50"
                                                                            : "border-transparent"
                                                                }
                            ${day.is_booked ? "cursor-not-allowed" : "hover:scale-105"}
                        `}
                                                                onClick={() => !day.is_booked && handleDateClick(day.date)}
                                                            >
                                                                <div className="text-center">
                                                                    <div className="text-sm font-medium">{format(day.date, "d")}</div>
                                                                    {day.is_booked ? (
                                                                        <div className="text-xs text-gray-500">Booked</div>
                                                                    ) : (
                                                                        <>
                                                                            <div className="text-xs font-bold text-green-600">
                                                                                {formatVND(day.highest_bid).slice(0, -3)}K
                                                                            </div>
                                                                            <div className="text-xs text-gray-500">{day.active_bids} bids</div>
                                                                        </>
                                                                    )}
                                                                </div>
                                                                {!day.is_booked && (
                                                                    <div
                                                                        className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                                                                            day.demand_level === "low"
                                                                                ? "bg-green-400"
                                                                                : day.demand_level === "moderate"
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
                                                                {day.is_booked ? (
                                                                    <div className="text-red-600">This date is already booked</div>
                                                                ) : (
                                                                    <>
                                                                        <div>Current highest: {formatVND(day.highest_bid)}</div>
                                                                        <div>Min to win: {formatVND(day.minimum_to_win)}</div>
                                                                        <div>Active bids: {day.active_bids}</div>
                                                                        <div>Win rate: {Math.round(day.success_rate * 100)}%</div>
                                                                        <Badge className={getDemandColor(day.demand_level)} variant="outline">
                                                                            {day.demand_level} demand
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
                                </>
                            )}
                        </CardContent>
                    )}
                </Card>
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
                                        return dayData?.is_booked
                                    }).length
                                }{" "}
                                night(s) are already booked
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                onClick={() => handleBookedConfirmation(true)}
                                className="bg-transparent"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Accept Partial
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleBookedConfirmation(false)}
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
        </TooltipProvider>
    )
}