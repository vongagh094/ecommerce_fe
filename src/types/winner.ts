// Transformed data for internal use
export interface WinnerData {
    id: string;
    user_id: number;
    auction_id: string;
    check_in_date: string;
    check_out_date: string;
    total_amount: number;
    guest_count: number;
    nights: number;
}

export interface WinnerAlertProps {
    user_id: number;
    isOpen: boolean;
    onConfirm: (selectedBookings: WinnerData[]) => void;
    onDecline: () => void;
    auctionId: string;
}
// API Response Interface (matches your actual API response)
export interface ApiWinnerResponse {
    auction_id: string;
    check_in_win: string;
    check_out_win: string;
    amount: number;
    user_id: number;
}
export interface WinnerAlertProps {
    user_id: number;
    isOpen: boolean;
    onConfirm: (selectedBookings: WinnerData[]) => void;
    onDecline: () => void;
    auctionId: string;
    propertyId?: string;      // Add property information
    propertyName?: string;    // Add property name
}

// Payment URL Parameters Interface
export interface PaymentUrlParams {
    propertyId: string;
    propertyName: string;
    checkIn: string;
    checkOut: string;
    guestCount: number;
    amount: number;
    selectedNights: string;
}