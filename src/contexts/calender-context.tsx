"use client"
import {createContext, useContext} from "react";
import {useBidingState} from "@/hooks/use-calendar";
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

interface CalendarContextType {
    // State
    selectedDates: Date[]
    setSelectedDates: (dates: Date[]) => void
    totalBid: string
    setTotalBid: (bid: string) => void
    allowPartial: boolean
    setAllowPartial: (allow: boolean) => void
    showBookedDateModal: boolean
    setShowBookedDateModal: (show: boolean) => void
    pendingDateSelection: Date[]

    // Methods
    handleDateSelect: (date: Date, calendarData: DayData[]) => {
        success: boolean
        hasBookedDates: boolean
    }
    handleBookedDateConfirmation: (
        acceptPartial: boolean,
        calendarData: DayData[]
    ) => {
        success: boolean
        selectedCount: number
    }
    clearSelection: () => void

    // Computed
    selectedNights: number
    bidPerNight: number
}

const CalendarContext = createContext<CalendarContextType | undefined >(undefined)
export function CalendarProvider({children}) {
    const CalendarState = useBidingState()

    return (
        <CalendarContext.Provider value={CalendarState}>
            {children}
        </CalendarContext.Provider>
    );
}

export function useCalendarContext() {
    const context = useContext(CalendarContext);
    if (!context) {
        throw new Error('useBookingContext must be used within BookingProvider');
    }
    return context;
}