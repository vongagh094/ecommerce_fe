
export interface CalendarDay {
    date: string;
    highest_bid: number;
    active_bids: number;
    minimum_to_win: number;
    base_price: number;
    demand_level: string;
    success_rate: number;
    is_available: boolean;
    is_booked: boolean;
}

export interface CalendarData {
    property_id: number;
    month: number;
    year: number;
    days: CalendarDay[];
}

export interface UserBid {
    bid_id: string;
    auction_id: number;
    user_id: string;
    check_in: string;
    check_out: string;
    total_amount: number;
    price_per_night: number;
    nights: number;
    bid_time: string;
    status: string;
}
export interface WinLossComparison {
    [date: string]: {
        user_bid: number;
        current_highest: number;
        status: 'WINNING' | 'LOSING';
        difference: number;
        is_winning: boolean;
    };
}
export interface WinLossData {
    success: boolean;
    has_bid: boolean;
    user_bid?: UserBid;
    comparison?: WinLossComparison;
    summary?: {
        win_rate: number;
        winning_dates: string[];
        losing_dates: string[];
        total_nights: number;
        winning_nights: number;
        losing_nights: number;
    };
}