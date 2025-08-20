
export interface BookingPanelProps {
    auction_id: string;
    currentBid: number;
    lowestOffer: number;
    timeLeft: string;
}
export interface BidData{
    user_id: number
    property_id: number
    auction_id: string
    bid_amount: string
    bid_time: string
    check_in: string
    check_out: string
    allow_partial: boolean
    partial_awarded: boolean
    created_at: string
}