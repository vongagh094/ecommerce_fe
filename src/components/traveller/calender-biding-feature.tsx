"use client"
import {useState, useEffect, useMemo, useCallback} from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/biding/card"
import { Button } from "@/components/ui/biding/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/biding/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/biding/dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuctionCalendarContext } from "@/contexts/auction-calendar-context";
import SimpleCountdownTimer from "@/components/traveller/PollingCountDown"
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
import {useAuctionCountdown} from "@/hooks/use-countdown";
import { addMonths, subMonths, format, isSameDay, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns"
import {useCalendarContext} from "@/contexts/calender-context";
import SimpleCountdown from "@/components/traveller/count-down";

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
    isInBiddingWindow?: boolean
    disabled?: boolean
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

    // Use shared booking state - keeping compatibility với existing code
    const {
        selectedDates,
        setSelectedDates,
        showBookedDateModal,
        setShowBookedDateModal,
        pendingDateSelection,
        handleBookedDateConfirmation
    } = useCalendarContext()

    // Use shared auction context
    const {
        ableSelectDates,
        setAbleSelectDates,
        selectedAuction,
        isDateInBiddingWindow
    } = useAuctionCalendarContext()


    // Local state for calendar
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [showBiddingCalendar, setShowBiddingCalendar] = useState(false)
    const [loading, setLoading] = useState(false)
    const [calendarData, setCalendarData] = useState<DayData[]>([])
    const [tripSuggestions, setTripSuggestions] = useState<TripSuggestion[]>([])
    const [refreshCount, setRefreshCount] = useState(0)
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

    // Helper function to calculate nights properly
    const calculateNights = (dates: Date[]): number => {
        //OPTION 1: Each selected date = 1 night (your preferred logic)
        return dates.length;

        // OPTION 2: Hotel style (dates.length - 1) - commented out
        // return Math.max(0, dates.length - 1);
    }

    // Helper function to get date range display
    const getDateRangeDisplay = (dates: Date[]) => {
        if (dates.length === 0) return { checkIn: null, checkOut: null, nights: 0 };

        const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());

        return {
            checkIn: sortedDates[0],
            checkOut: sortedDates[sortedDates.length - 1],
            nights: calculateNights(dates)
        };
    }

    // ==================== REST OF THE COMPONENT ====================

    // Fetch calendar data from API
    const fetchCalendarData = useCallback(async (month: number, year: number, source = 'unknown') => {
        if (!selectedAuction) {
            console.log('⚠️ No selectedAuction, clearing calendar data');
            setCalendarData([]);
            return;
        }

        console.log('🔄 Fetching calendar data...', {
            month,
            year,
            source,
            auctionId: selectedAuction.id,
            timestamp: new Date().toLocaleTimeString()
        });

        setLoading(true)

        try {
            const response = await fetch(
                `${API_URL}/calendar/properties/${property_id}/calendar?auction_id=${selectedAuction.id}&month=${month}&year=${year}`,
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

            // console.log('✅ Calendar data received:', {
            //     count: calendarDataWithDates.length,
            //     source,
            //     firstDay: calendarDataWithDates[0]?.date.toDateString(),
            //     lastDay: calendarDataWithDates[calendarDataWithDates.length - 1]?.date.toDateString(),
            //     sampleData: calendarDataWithDates.slice(0, 2)
            // });

            // 🎯 UPDATE STATE - This should trigger calendarGrid recalculation
            setCalendarData(calendarDataWithDates)

            // Track refresh
            if (source === 'timer') {
                setRefreshCount(prev => prev + 1);
                setLastRefresh(new Date());
            }

            // Fetch trip suggestions
            if (responseData.trip_suggestions) {
                setTripSuggestions(responseData.trip_suggestions)
            }

        } catch (error) {
            console.error('❌ Error fetching calendar data:', error)
            toast({
                title: "Error",
                description: "Failed to load calendar data",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }, [selectedAuction, property_id, toast])

    // Generate calendar grid với bidding window logic
    const generateCalendarGrid = () => {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()

        const firstDayOfMonth = new Date(year, month, 1)
        const lastDayOfMonth = new Date(year, month + 1, 0)
        const startingDayOfWeek = firstDayOfMonth.getDay()
        const daysInMonth = lastDayOfMonth.getDate()

        const calendarGrid = []

        // Empty cells for days before first day of month
        for (let i = 0; i < startingDayOfWeek; i++) {
            calendarGrid.push(null)
        }

        // Add all days in month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day)

            // **KEY LOGIC: Check if date is in bidding window**
            const isInWindow = isDateInBiddingWindow(date)

            // Find data from API for this day
            const dayData = calendarData.find(d => isSameDay(d.date, date))

            if (dayData) {
                // Have data from API - apply bidding window logic
                calendarGrid.push({
                    ...dayData,
                    isInBiddingWindow: isInWindow,
                    // CRITICAL: Only available if in bidding window AND not booked
                    is_available: isInWindow && !dayData.is_booked,
                    disabled: !isInWindow || dayData.is_booked
                })
            } else {
                // No data from API - create default data
                if (isInWindow && selectedAuction) {
                    // In bidding window - allow bidding with default data
                    calendarGrid.push({
                        date: date,
                        highest_bid: selectedAuction.starting_price,
                        active_bids: 0,
                        minimum_to_win: selectedAuction.minimum_bid,
                        base_price: selectedAuction.starting_price,
                        demand_level: "low" as const,
                        success_rate: 0.7,
                        is_available: true,
                        is_booked: false,
                        isInBiddingWindow: true,
                        disabled: false
                    })
                } else {
                    // CRITICAL: Outside bidding window - DISABLE completely
                    calendarGrid.push({
                        date: date,
                        highest_bid: 0,
                        active_bids: 0,
                        minimum_to_win: 0,
                        base_price: 0,
                        demand_level: "low" as const,
                        success_rate: 0,
                        is_available: false, // NOT AVAILABLE
                        is_booked: false,
                        isInBiddingWindow: false,
                        disabled: true // DISABLED
                    })
                }
            }
        }

        return calendarGrid
    }
    const calendarGrid = useMemo(() => {
        // console.log('🔄 Regenerating calendar grid...', {
        //     calendarDataLength: calendarData.length,
        //     currentMonth: format(currentMonth, "MMM yyyy"),
        //     timestamp: new Date().toLocaleTimeString()
        // });

        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()

        const firstDayOfMonth = new Date(year, month, 1)
        const lastDayOfMonth = new Date(year, month + 1, 0)
        const startingDayOfWeek = firstDayOfMonth.getDay()
        const daysInMonth = lastDayOfMonth.getDate()

        const grid = []

        // Empty cells for days before first day of month
        for (let i = 0; i < startingDayOfWeek; i++) {
            grid.push(null)
        }

        // Add all days in month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day)
            const isInWindow = isDateInBiddingWindow(date)

            // 🎯 KEY: Find data from updated calendarData
            const dayData = calendarData.find(d => isSameDay(d.date, date))

            if (dayData) {
                // Have data from API - apply bidding window logic
                grid.push({
                    ...dayData,
                    isInBiddingWindow: isInWindow,
                    is_available: isInWindow && !dayData.is_booked,
                    disabled: !isInWindow || dayData.is_booked
                })
            } else {
                // No data from API - create default data
                if (isInWindow && selectedAuction) {
                    grid.push({
                        date: date,
                        highest_bid: selectedAuction.starting_price || 0,
                        active_bids: 0,
                        minimum_to_win: selectedAuction.minimum_bid || 0,
                        base_price: selectedAuction.starting_price || 0,
                        demand_level: "low" as const,
                        success_rate: 0.7,
                        is_available: true,
                        is_booked: false,
                        isInBiddingWindow: true,
                        disabled: false
                    })
                } else {
                    grid.push({
                        date: date,
                        highest_bid: 0,
                        active_bids: 0,
                        minimum_to_win: 0,
                        base_price: 0,
                        demand_level: "low" as const,
                        success_rate: 0,
                        is_available: false,
                        is_booked: false,
                        isInBiddingWindow: false,
                        disabled: true
                    })
                }
            }
        }

        // console.log('✅ Calendar grid generated:', {
        //     totalCells: grid.length,
        //     validDays: grid.filter(d => d !== null).length,
        //     availableDays: grid.filter(d => d && d.is_available).length
        // });

        return grid
    }, [calendarData, currentMonth, selectedAuction, isDateInBiddingWindow])
    // Load calendar data when the month or selectedAuction changes
    useEffect(() => {
        const month = currentMonth.getMonth() + 1
        const year = currentMonth.getFullYear()
        fetchCalendarData(month, year)
    }, [currentMonth, property_id, selectedAuction]) // selectedAuction dependency is key

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

    const handleDateClick = (date: Date, dayData: DayData) => {
        // Block clicks on disabled dates
        if (!ableSelectDates) {
            // Optional: Show notification/toast
            console.log("Auction is not active - cannot select dates");
            return; // Exit early
        }

        if (dayData.disabled || !dayData.isInBiddingWindow) {
            toast({
                title: "Date Not Available",
                description: "This date is outside the bidding window for the selected auction.",
                variant: "destructive",
            })
            return;
        }

        if (dayData.is_booked) {
            toast({
                title: "Date Already Booked",
                description: "This date is already booked and cannot be selected.",
                variant: "destructive",
            })
            return;
        }

        // NEW LOGIC: Check-in/Check-out style selection
        const currentDates = [...selectedDates];

        // Case 1: No dates selected yet OR both check-in and check-out are already selected
        // -> Start fresh with new check-in date
        if (currentDates.length === 0 || currentDates.length >= 2) {
            setSelectedDates([date]);
            toast({
                title: "Check-in Date Selected",
                description: `Check-in: ${format(date, "MMM d, yyyy")}. Now select your check-out date.`,
                duration: 3000,
            });
            return;
        }

        // Case 2: Only check-in date is selected
        if (currentDates.length === 1) {
            const checkInDate = currentDates[0];

            // If clicking the same date, deselect it
            if (isSameDay(date, checkInDate)) {
                setSelectedDates([]);
                toast({
                    title: "Selection Cleared",
                    description: "Please select your check-in date again.",
                });
                return;
            }

            // If clicking a date BEFORE check-in, reset with new check-in
            if (date < checkInDate) {
                setSelectedDates([date]);
                toast({
                    title: "Check-in Date Updated",
                    description: `New check-in: ${format(date, "MMM d, yyyy")}. Now select your check-out date.`,
                    duration: 3000,
                });
                return;
            }

            // If clicking a date AFTER check-in, set as check-out
            // Generate all dates in the range
            const dateRange = eachDayOfInterval({start: checkInDate, end: date});

            // Check if any dates in range are booked
            const bookedDatesInRange = dateRange.filter(rangeDate => {
                const dayInfo = calendarData.find(d => isSameDay(d.date, rangeDate));
                return dayInfo?.is_booked || (dayInfo && dayInfo.disabled);
            });

            if (bookedDatesInRange.length > 0) {
                // Some dates in range are booked - show modal or warning
                toast({
                    title: "Range Contains Booked Dates",
                    description: `${bookedDatesInRange.length} date(s) in your range are unavailable. Please select a different range.`,
                    variant: "destructive",
                });
                return;
            }

            // All dates in range are available - confirm selection
            setSelectedDates(dateRange);
            const nights = calculateNights(dateRange);

            toast({
                title: "Date Range Selected! 🎯",
                description: `Check-in: ${format(checkInDate, "MMM d")} | Check-out: ${format(date, "MMM d")} | ${nights} nights`,
                duration: 4000,
            });
        }
    }

    const handleTimerRefresh = useCallback(() => {
        console.log('⏰ Timer triggered refresh');
        const month = currentMonth.getMonth() + 1;
        const year = currentMonth.getFullYear();
        fetchCalendarData(month, year, 'timer');
    }, [currentMonth, fetchCalendarData]);

    const selectSuggestion = (suggestion: TripSuggestion) => {
        // IMPORTANT: Fix trip suggestion logic too
        const range = eachDayOfInterval({ start: suggestion.startDate, end: suggestion.endDate })
        setSelectedDates(range)
        setShowBiddingCalendar(true)

        const nightsCount = calculateNights(range);
        toast({
            title: "Trip Selected! 🎯",
            description: `Selected ${range.length} dates for ${nightsCount} nights`,
        })
    }

    const handleBookedConfirmation = (acceptPartial: boolean) => {
        // Use existing logic from useCalendarContext if needed
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

    // Get display info for selected dates
    const dateRangeInfo = getDateRangeDisplay(selectedDates);

    return (
        <TooltipProvider>
            <div className="flex flex-col gap-4">
                {/* Show selected auction info */}
                {selectedAuction && (
                    <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                        <CardHeader>
                            <CardTitle className="flex items-center text-blue-700">
                                <CalendarIcon className="h-5 w-5 mr-2" />
                                Selected Auction Period
                            </CardTitle>
                            <CardDescription>
                                You can only bid for dates between {format(new Date(selectedAuction.start_date), "MMM d")} and {format(new Date(selectedAuction.end_date), "MMM d, yyyy")}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                {/* Smart Bidding Calendar */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center">
                                    <CalendarIcon className="h-5 w-5 mr-2" />
                                    Bidding Calendar
                                </CardTitle>

                                {/* 🎯 Enhanced timer display */}
                                <div className="flex items-center space-x-4 mt-2">
                                    <SimpleCountdownTimer
                                        interval={10000}
                                        onTick={handleTimerRefresh}  // 🎯 Use proper callback
                                        enabled={!loading}           // 🎯 Disable when loading
                                    />
                                    {lastRefresh && (
                                        <div className="text-xs text-gray-500">
                                            Last refresh: {lastRefresh.toLocaleTimeString()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                onClick={() => setShowBiddingCalendar(!showBiddingCalendar)}
                                className="bg-transparent"
                            >
                                {showBiddingCalendar ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                                <span className="ml-2">
                                    {showBiddingCalendar ? "Hide" : "Show"} Calendar
                                </span>
                            </Button>

                        </div>
                    </CardHeader>
                    {showBiddingCalendar && (
                        <CardContent className="space-y-6">
                            {!selectedAuction ? (
                                <div className="text-center py-8 text-gray-500">
                                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>Please select an auction to view available dates</p>
                                </div>
                            ) : (
                                <>
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
                                                            return <div key={index} className="p-3"></div>
                                                        }

                                                        const isSelected = selectedDates.some((date) => isSameDay(date, day.date))
                                                        const isInRange =
                                                            selectedDates.length > 1 &&
                                                            day.date >= selectedDates[0] &&
                                                            day.date <= selectedDates[selectedDates.length - 1]

                                                        // Different styling for disabled dates
                                                        const getDateStyling = () => {
                                                            if (day.disabled || !day.isInBiddingWindow) {
                                                                return "bg-gray-50 border-gray-200 cursor-not-allowed opacity-50"
                                                            }
                                                            if (day.is_booked) {
                                                                return "bg-gray-100 border-gray-300 cursor-not-allowed"
                                                            }
                                                            if (isSelected) {
                                                                return "border-purple-500 ring-2 ring-purple-200 scale-105 " + getDemandBgColor(day.demand_level)
                                                            }
                                                            if (isInRange) {
                                                                return "border-purple-300 bg-purple-50"
                                                            }
                                                            return getDemandBgColor(day.demand_level) + " hover:scale-105 cursor-pointer"
                                                        }

                                                        return (
                                                            <Tooltip key={day.date.getTime()}>
                                                                <TooltipTrigger asChild>
                                                                    <div
                                                                        className={`
                                                                            relative p-3 rounded-lg border-2 transition-all duration-200
                                                                            ${getDateStyling()}
                                                                        `}
                                                                        onClick={() => handleDateClick(day.date, day)}
                                                                    >
                                                                        <div className="text-center">
                                                                            <div className="text-sm font-medium">{format(day.date, "d")}</div>
                                                                            {day.disabled || !day.isInBiddingWindow ? (
                                                                                <div className="text-xs text-gray-400">Not available</div>
                                                                            ) : day.is_booked ? (
                                                                                <div className="text-xs text-gray-500">Booked</div>
                                                                            ) : (
                                                                                <>
                                                                                    <div className="text-xs font-bold text-green-600">
                                                                                        {formatVND(day.highest_bid).slice(0, -2)}K
                                                                                    </div>
                                                                                    {/*<div className="text-xs text-gray-500">{day.active_bids} bids</div>*/}
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                        {!day.disabled && !day.is_booked && day.isInBiddingWindow && (
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
                                                                        {day.disabled || !day.isInBiddingWindow ? (
                                                                            <div className="text-red-600">Outside bidding window</div>
                                                                        ) : day.is_booked ? (
                                                                            <div className="text-red-600">This date is already booked</div>
                                                                        ) : (
                                                                            <>
                                                                                <div>Current highest: {formatVND(day.highest_bid * 1000)}</div>
                                                                                <div>Min to win: {formatVND(day.minimum_to_win * 1000)}</div>
                                                                                <div>Win rate: {Math.round(day.success_rate)}%</div>
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
                                                    <span className="text-sm">Booked/Unavailable</span>
                                                </div>
                                            </div>

                                            {/* FIXED: Selected Dates Summary */}
                                            {selectedDates.length > 0 && (
                                                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                                                    <div className="flex items-center space-x-2 text-green-700 mb-2">
                                                        <CheckCircle className="h-4 w-4" />
                                                        <span className="font-medium">Selected Dates</span>
                                                    </div>
                                                    <div className="text-green-600 text-sm space-y-1">
                                                        {dateRangeInfo.checkIn && (
                                                            <div><strong>Start date:</strong> {format(dateRangeInfo.checkIn, "MMM d, yyyy")}</div>
                                                        )}
                                                        {dateRangeInfo.checkOut && selectedDates.length > 1 && (
                                                            <div><strong>End date:</strong> {format(dateRangeInfo.checkOut, "MMM d, yyyy")}</div>
                                                        )}
                                                        <div><strong>Selected dates:</strong> {selectedDates.length}</div>
                                                        <div><strong>Total nights:</strong> {dateRangeInfo.nights}</div>

                                                        {/* Show calculation explanation */}
                                                        <div className="text-xs text-green-500 mt-2 italic">
                                                            Note: Each selected date = 1 night of stay
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </CardContent>
                    )}
                </Card>
            </div>

            {/* Booked Date Modal - keeping for compatibility */}
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