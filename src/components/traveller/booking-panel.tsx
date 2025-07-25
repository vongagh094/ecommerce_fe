"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import  useWebsocket  from "@/hooks/use-Websocket"
import History_render from "@/components/traveller/biddings_history/history_render"
import { BookingPanelProps } from "@/types/bidding"
import {useBidding} from "@/hooks/use-bidding";
import {validationBidAmount} from "@/lib/utils";

// Function to render the booking panel
export function BookingPanel({ currentBid, lowestOffer, timeLeft }: BookingPanelProps) {

  const [bidAmount, setBidAmount] = useState<string>("")

  const bidData = {
    user_id : '1',
    auction_id: "22222222-2222-2222-2222-222222222222",
    bid_amount: bidAmount ,
    bid_time: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }

  const {isSubmitting,error,handleBid} = useBidding(bidData)
  const highestBid = useWebsocket(bidData.auction_id)
  const currentHighestBid = currentBid || highestBid || 0
  const validationError = validationBidAmount(bidData.bid_amount.toString(), currentHighestBid);

  const formatPrice = (price: number) => {
    return `₫ ${price.toLocaleString()}`
  }

  const onSubmit = () => {
    if(validationError) {
      return
    }
    handleBid(bidData)
  }
  return (
    <Card className="sticky top-24">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Bidding Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">2 nights are on bidding</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">CHECK-IN</label>
                <div className="text-sm text-gray-900">6/23/2023</div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">CHECKOUT</label>
                <div className="text-sm text-gray-900">6/25/2023</div>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium text-gray-500 uppercase">GUESTS</label>
              <div className="text-sm text-gray-900">1 guest</div>
            </div>
          </div>

          {/* Bidding Information */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Current highest bid</span>
              <span className="font-semibold">{formatPrice(highestBid || currentBid)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Lowest offer</span>
              <span className="font-semibold">{formatPrice(lowestOffer)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Time left</span>
              <span className="text-sm font-medium text-rose-600">{timeLeft}</span>
            </div>
            <History_render/>
          </div>

          {/* Bid Input */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Your bid (per night)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₫</span>
              <Input
                type="text"
                value={bidAmount} // here need to update when web socket changes
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="Choose your bid here"
                className="pl-8"
              />
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Must be at least</span>
              <span className="font-semibold">{formatPrice(highestBid || currentBid)}</span>
            </div>
          </div>

          {/* Place Bid Button */}
          <Button
              className="w-full bg-rose-500 hover:bg-rose-600 text-white"
              onClick={onSubmit}
              disabled={isSubmitting || !!validationError}
          >
            {isSubmitting ? "Placing bid..." : "Place a bid"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}