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
                                    Place your bid for selected dates
                                </CardDescription>
                            </div>
                            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                                <Flame className="h-3 w-3 mr-1" />
                                Live
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        {/* Selected Dates Display */}
                        {selectedDates.length > 0 ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-blue-900">
                                            {selectedNights} nights selected
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearSelection}
                                            className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
                                        >
                                            Clear
                                        </Button>
                                    </div>
                                    <div className="text-sm text-blue-700 mb-3">
                                        {format(selectedDates[0], "MMM d")} -{" "}
                                        {format(selectedDates[selectedDates.length - 1], "MMM d")}
                                    </div>
                                </div>

                                {/* Bid Input */}
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
                                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                            <div className="text-center">
                                                <div className="text-green-800 text-sm">Per night</div>
                                                <div className="font-bold text-green-600 text-xl">
                                                    ${bidPerNight}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Partial Booking Toggle */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <Users className="h-4 w-4 text-gray-600" />
                                        <div>
                                            <Label className="text-sm font-medium">Allow Partial Booking</Label>
                                            <p className="text-xs text-gray-600">
                                                Accept partial stays if not all nights win
                                            </p>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={allowPartial}
                                        onCheckedChange={setAllowPartial}
                                    />
                                </div>

                                {/* Submit Button */}
                                <Button
                                    onClick={handleSubmitBid}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                    size="lg"
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
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-500">
                                <CalendarDays className="h-8 w-8 mx-auto mb-2" />
                                <p className="text-sm">Select dates from calendar to start bidding</p>
                                <p className="text-xs">Choose your preferred dates and nights</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Market Insights - Static data hoặc từ API */}
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
    )
}