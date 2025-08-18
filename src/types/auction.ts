
interface CalendarDay {
    date: Date;
    highest_bid: number;
    active_bids: number;
    minimum_to_win: number;
    base_price: number;
    demand_level: 'low' | 'moderate' | 'high';
    success_rate: number;
    is_available: boolean;
    is_booked: boolean;
}
export interface AuctionInfo {
    id: string;
    property_id: number;
    start_date: string;
    end_date: string;
    min_nights: number;
    max_nights: number;
    starting_price: number;
    bid_increment: number;
    minimum_bid: number;
    auction_start_time: string;
    auction_end_time: string;
    objective: string;
    status: 'ACTIVE' | 'PENDING' | 'COMPLETED';
    total_bids: number;
    current_highest_bid: number | null;
    created_at: string;
}
