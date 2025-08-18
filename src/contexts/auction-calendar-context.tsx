"use client"
import {AuctionInfo} from "@/types/auction";
import {createContext, ReactNode, useContext, useState, useEffect} from "react";

interface AuctionContextType {
    ableSelectDates: boolean,
    setAbleSelectDates : (able: boolean) => void,
    selectedAuction: AuctionInfo | null;
    setSelectedAuction: (auction: AuctionInfo | null) => void;
    isDateInBiddingWindow: (date: Date) => boolean;
    getBiddingDateRange: () => { start: Date; end: Date } | null;
}

// Create Context
export const AuctionCalendarContext = createContext<AuctionContextType | undefined>(undefined);

// Provider Component
interface AuctionProviderProps {
    children: ReactNode;
}

export const AuctionProvider: React.FC<AuctionProviderProps> = ({ children }) => {
    const [selectedAuction, setSelectedAuction] = useState<AuctionInfo | null>(null);
    const [ableSelectDates, setAbleSelectDates] = useState(true)
    // Check if date is in bidding window (từ start_date đến end_date của auction)
    const isDateInBiddingWindow = (date: Date): boolean => {
        if (!selectedAuction) {
            return false;
        }

        try {
            // Chuyển đổi string dates thành Date objects
            const biddingStart = new Date(selectedAuction.start_date);
            const biddingEnd = new Date(selectedAuction.end_date);

            // Normalize ngày để so sánh (set về 00:00:00)
            const checkDate = new Date(date);
            checkDate.setHours(0, 0, 0, 0);
            biddingStart.setHours(0, 0, 0, 0);
            biddingEnd.setHours(0, 0, 0, 0);

            // Kiểm tra ngày nằm trong khoảng [start_date, end_date)
            // Note: end_date là ngày check-out nên không bao gồm
            return checkDate >= biddingStart && checkDate < biddingEnd;
        } catch (error) {
            console.error("Error in isDateInBiddingWindow:", error);
            return false;
        }
    };

    // Get bidding date range
    const getBiddingDateRange = (): { start: Date; end: Date } | null => {
        if (!selectedAuction) return null;

        try {
            return {
                start: new Date(selectedAuction.auction_start_time),
                end: new Date(selectedAuction.auction_end_time)
            };
        } catch (error) {
            console.error("Error getting bidding date range:", error);
            return null;
        }
    };


    // Auto clear dates when auction changes
    const handleSetSelectedAuction = (auction: AuctionInfo | null) => {
        setSelectedAuction(auction);
        // nếu chưa tới hạn bid hoặc hết hạn thì ableSelectDates = false
        if (auction && (new Date(auction.auction_end_time) < new Date() || new Date(auction.auction_start_time) > new Date())) {
            setAbleSelectDates(false)
        } else {
            setAbleSelectDates(true)
        }
    };

    const value: AuctionContextType = {
        ableSelectDates,
        setAbleSelectDates,
        selectedAuction,
        setSelectedAuction: handleSetSelectedAuction,
        isDateInBiddingWindow,
        getBiddingDateRange
    };

    return (
        <AuctionCalendarContext.Provider value={value}>
            {children}
        </AuctionCalendarContext.Provider>
    );
};

export const useAuctionCalendarContext = (): AuctionContextType => {
    const context = useContext(AuctionCalendarContext);
    if (!context) {
        throw new Error('useAuctionCalendarContext must be used within an AuctionProvider');
    }
    return context;
};