import {eachDayOfInterval, isSameDay} from "date-fns";
import {useCallback, useEffect, useRef, useState} from "react";
import { WinLossData} from "@/types/calendar";
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

        //Chỉ check ngày đã THỰC SỰ book (không phải đang đấu giá)
        const hasUnavailableDates = newRange.some((rangeDate) => {
            const dayData = calendarData.find((d) => isSameDay(d.date, rangeDate))
            // Chỉ block nếu:
            // - Ngày không available (is_available = false)
            // - HOẶC đã book THẬT SỰ (is_booked = true VÀ auction đã kết thúc)
            return !dayData?.is_available ||
                (dayData?.is_booked )
        })

        if (hasUnavailableDates && newRange.length > 1) {
            setPendingDateSelection(newRange)
            setShowBookedDateModal(true)
            return { success: false, hasBookedDates: false }
        }

        setSelectedDates(newRange)
        return { success: true, hasBookedDates: false }
    }, [selectedDates])

    // // Handle booked date confirmation
    // const handleBookedDateConfirmation = useCallback((
    //     acceptPartial: boolean,
    //     calendarData: DayData[]
    // ) => {
    //     if (acceptPartial) {
    //         const availableDates = pendingDateSelection.filter((date) => {
    //             const dayData = calendarData.find((d) => isSameDay(d.date, date))
    //             return !dayData?.is_booked
    //         })
    //         setSelectedDates(availableDates)
    //         setAllowPartial(true)
    //         setShowBookedDateModal(false)
    //         setPendingDateSelection([])
    //         return { success: true, selectedCount: availableDates.length }
    //     } else {
    //         setShowBookedDateModal(false)
    //         setPendingDateSelection([])
    //         return { success: false, selectedCount: 0 }
    //     }
    // }, [pendingDateSelection])

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
        // handleBookedDateConfirmation,
        clearSelection,

        // Computed
        selectedNights,
        bidPerNight
    }
}
export const useWinLossStatusPolling = (
    auctionId: string,
    userId: number,
    propertyId: number,
    pollingInterval: number = 15000 // 15 seconds default
) => {
    const [winLossData, setWinLossData] = useState<WinLossData | null>(null);
    const [countdown, setCountdown] = useState(Math.floor(pollingInterval / 1000));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string>('');

    const fetchWinLossData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `http://localhost:8000/calendar/auction/${auctionId}/user/${userId}/win-loss-status?property_id=${propertyId}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setWinLossData(data);
            setLastUpdated(new Date().toLocaleTimeString());

            // Reset countdown
            setCountdown(Math.floor(pollingInterval / 1000));

            console.log('🎯 Win/Loss data updated:', data);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            console.error('❌ Win/Loss fetch error:', errorMessage);
        } finally {
            setLoading(false);
        }
    }, [auctionId, userId, propertyId, pollingInterval]);

    useEffect(() => {
        // Only fetch if we have valid IDs
        if (auctionId && userId && propertyId) {
            // Initial fetch
            fetchWinLossData();

            // Setup polling with countdown
            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        fetchWinLossData();
                        return Math.floor(pollingInterval / 1000); // Reset countdown
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [fetchWinLossData, pollingInterval]);

    return {
        winLossData,
        countdown,
        loading,
        error,
        lastUpdated,
        refetch: fetchWinLossData
    };
};
