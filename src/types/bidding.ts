
export interface BookingPanelProps {
    auction_id: string;
    currentBid: number;
    lowestOffer: number;
    timeLeft: string;
}
export interface BidData{
    user_id: string;
    auction_id: string;
    bid_amount: string;
    bid_time: string;
    created_at: string;
}