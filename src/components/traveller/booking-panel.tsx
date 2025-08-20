"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/biding/card"
import { Button } from "@/components/ui/biding/button"
import { Input } from "@/components/ui/biding/input"
import { Label } from "@/components/ui/biding/label"
import { Switch } from "@/components/ui/biding/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useCalendarContext } from "@/contexts/calender-context"
import {BidData} from "@/types/bidding";
import { useBidding } from "@/hooks/use-bidding";
import { useAuctionCalendarContext } from "@/contexts/auction-calendar-context";
import {
    CalendarDays,
    DollarSign,
    Trophy,
    Users,
    BarChart3,
    Eye,
    Flame,
    Shield,
    MessageCircle,
    Clock,
    Zap,
    TrendingDown,
} from "lucide-react"
import { format } from "date-fns"
import {boolean} from "zod";

interface BidingProps{
    user_id: number,
    property_id: number,
}
export function BookingPanel({
                                 user_id,
                                 property_id}: BidingProps) {
    const { toast } = useToast()


    const {selectedAuction} = useAuctionCalendarContext()
    // Use shared booking state
    const {
        selectedDates,
        totalBid,
        setTotalBid,
        allowPartial,
        setAllowPartial,
        clearSelection,
        selectedNights,
        bidPerNight
    } = useCalendarContext()


    // @ts-ignore
    const bidData : BidData = {
        user_id: user_id,
        property_id: property_id,
        auction_id: selectedAuction?.id || "00000000-0000-0000-0000-000000000000",
        bid_amount: totalBid,
        bid_time: new Date().toISOString(),
        check_in: selectedDates.length > 0 ? format(selectedDates[0], "yyyy-MM-dd") : "",
        check_out: selectedDates.length > 0 ? format(selectedDates[selectedDates.length - 1], "yyyy-MM-dd") : "",
        allow_partial: allowPartial,
        partial_awarded:!allowPartial, // set to false if allow_partial is false
        created_at: new Date().toISOString()
    }
     console.log(selectedAuction?.id)
    // using hook biding
    const {isSuccess, isSubmitting, error, handleBid } = useBidding(bidData)



    const handleSubmitBid = async () => {
        if (!selectedDates.length || !totalBid) {
            toast({
                title: "Missing Information",
                description: "Please select dates and enter your bid amount",
                variant: "destructive",
            })
            return
        }
        if (Number.parseFloat(totalBid) <= 0) {
            toast({
                title: "Invalid Bid Amount",
                description: "Please enter a valid bid amount greater than 0",
                variant: "destructive",
            })
            return
        }

        try {
            await handleBid(bidData)
            if (isSubmitting) {
                toast({
                    title: "Submitting Bid...",
                    description: "Please wait while your bid is being processed",
                })
            }
            if (isSuccess) {
                toast({
                    title: "Bid Submitted Successfully! 🎉",
                    description: `Your bid of $${totalBid} for ${selectedNights} nights has been submitted`,
                })

            }
        } catch (err) {
            toast({
                title: "Failed to Submit Bid",
                description: error || "An unexpected error occurred. Please try again.",
                variant: "destructive",
            })
        }
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="sticky top-24 space-y-6">
            </div>
        </div>
    )
}