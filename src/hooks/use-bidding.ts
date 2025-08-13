import {biddingAPI} from "@/lib/bidding";
import {BidData} from "@/types/bidding";
import {eachDayOfInterval, isSameDay} from "date-fns";
import {useCallback, useEffect, useState} from "react";
export const useBidding = (bidData: BidData) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const handleBid = async (bidData:BidData) => {
        setIsSubmitting(true);
        setError(null);
        try{
            await biddingAPI.fetch_sending_bid(bidData);
            await biddingAPI.fetch_receiving_bid();
        }
        catch (error) {
            console.error('Error sending bid:', error);
            setError('Failed to place bid. Please try again.');
        }
        finally {
            setIsSubmitting(false);
        }
    }
    return {isSubmitting, error, handleBid};
}

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

export function useBidingState() {
    // Chỉ quản lý state cần thiết để share
    const [selectedDates, setSelectedDates] = useState<Date[]>([])
    const [totalBid, setTotalBid] = useState("")
    const [allowPartial, setAllowPartial] = useState(true)

    // Modal states cho booked dates
    const [showBookedDateModal, setShowBookedDateModal] = useState(false)
    const [pendingDateSelection, setPendingDateSelection] = useState<Date[]>([])

    // Handle date selection với validation
    const handleDateSelect = useCallback((date: Date, calendarData: DayData[]) => {
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

        // Check for booked dates
        const hasBookedDates = newRange.some((rangeDate) => {
            const dayData = calendarData.find((d) => isSameDay(d.date, rangeDate))
            return dayData?.is_booked
        })

        if (hasBookedDates && newRange.length > 1) {
            setPendingDateSelection(newRange)
            setShowBookedDateModal(true)
            return { success: false, hasBookedDates: true }
        }

        setSelectedDates(newRange)
        return { success: true, hasBookedDates: false }
    }, [selectedDates])

    // Handle booked date confirmation
    const handleBookedDateConfirmation = useCallback((
        acceptPartial: boolean,
        calendarData: DayData[]
    ) => {
        if (acceptPartial) {
            const availableDates = pendingDateSelection.filter((date) => {
                const dayData = calendarData.find((d) => isSameDay(d.date, date))
                return !dayData?.is_booked
            })
            setSelectedDates(availableDates)
            setAllowPartial(true)
            setShowBookedDateModal(false)
            setPendingDateSelection([])
            return { success: true, selectedCount: availableDates.length }
        } else {
            setShowBookedDateModal(false)
            setPendingDateSelection([])
            return { success: false, selectedCount: 0 }
        }
    }, [pendingDateSelection])

    // Clear selection
    const clearSelection = useCallback(() => {
        setSelectedDates([])
        setTotalBid("")
    }, [])

    // Computed values
    const selectedNights = selectedDates.length
    const bidPerNight = totalBid && selectedNights > 0
        ? Math.round(Number.parseFloat(totalBid) / selectedNights)
        : 0
    return {
        // Main state
        selectedDates,
        setSelectedDates,
        totalBid,
        setTotalBid,
        allowPartial,
        setAllowPartial,

        // Modal state
        showBookedDateModal,
        setShowBookedDateModal,
        pendingDateSelection,

        // Methods
        handleDateSelect,
        handleBookedDateConfirmation,
        clearSelection,

        // Computed
        selectedNights,
        bidPerNight
    }
}