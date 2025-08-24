"use client"
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import WinnerAlert from '@/components/traveller/winner-alert';
import {useCalendarContext} from "@/contexts/calender-context";
import {WinnerData} from "@/types/winner";

interface WinnerContextType {
    setPropertyId: (propertyId: number) => void;
    setPropertyName: (propertyName: string) => void;
    showWinnerAlert: (auctionId: string) => void;
    hideWinnerAlert: () => void;
    isAlertOpen: boolean;
    currentAuctionId: string | null;
    handleAuctionEnd: (auctionId: string) => void;
}

const WinnerContext = createContext<WinnerContextType | undefined>(undefined);

interface WinnerProviderProps {
    children: ReactNode;
}

export const WinnerProvider = ({ children }: WinnerProviderProps) => {
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [currentAuctionId, setCurrentAuctionId] = useState<string | null>(null);
    const [PropertyId, setPropertyId] = useState<number | null>(null);
    const [PropertyName, setPropertyName] = useState<string | null>(null);
    const router = useRouter();

    // Get user from auth context (no need to fetch separately)
    const { user } = useAuth();
    const currentUserId = user?.id ? parseInt(user.id) : 1;

    // Get allow_partial setting from the calendar context
    const { allowPartial } = useCalendarContext();
    const showWinnerAlert = (auctionId: string) => {
        console.log(`Showing winner alert for auction: ${auctionId}`);
        setCurrentAuctionId(auctionId);
        setIsAlertOpen(true);
    };

    const hideWinnerAlert = () => {
        console.log('Hiding winner alert');
        setIsAlertOpen(false);
        setCurrentAuctionId(null);
    };

    const handleAuctionEnd = (auctionId: string) => {
        console.log(`Auction ${auctionId} ended - User ID: ${currentUserId}, Allow Partial: ${allowPartial}`);
        showWinnerAlert(auctionId);
    };
    const routeThePaymentPage = (winner: WinnerData, index:number) => {
        const baseUrl = 'http://localhost:3000/dashboard/payment/instant?';
        const params = new URLSearchParams();
        params.set('propertyId', PropertyId?.toString() || '')
        params.set('propertyName', PropertyName?.toString() || '')
        params.set('checkIn', winner.check_in_date)
        params.set('checkOut', winner.check_out_date)
        params.set('guestCount', (winner.guest_count).toString())
        params.set('amount', (winner.total_amount * 1000).toString())
        params.set('selectedNights', winner.check_in_date)

        const paymentUrl = `${baseUrl}${params.toString()}`;
        setTimeout(() => {
            const newWindow = window.open(paymentUrl, '_blank');
            if (!newWindow) {
                console.log(`Popup ${index + 1} bị block!`);
            } else {
                console.log(`Tab ${index + 1} opened successfully!`);
            }
        }, index * 10000); // Delay 10 giây cho mỗi tab
    }

    // Handle payment navigation - this is where you'll integrate your payment API
    const handlePaymentConfirm = (selectedBookings: WinnerData[]) => {
        console.log('Payment confirmed for bookings:', selectedBookings);
        console.log('Allow partial setting:', allowPartial);

        if (selectedBookings.length === 1) {
            routeThePaymentPage(selectedBookings[0], 0)

        } else if (selectedBookings.length > 1) {
                // Multiple bookings payment - tạo separate payment links cho từng booking
                selectedBookings.forEach((booking, index) => {
                    // Tạo params riêng cho từng booking
                    routeThePaymentPage(booking, index)
                });
        }
        // For now, just close the alert
        hideWinnerAlert();
    };

    const handleDecline = () => {
        console.log('User declined - closing alert');
        hideWinnerAlert();
    };

    return (
        <WinnerContext.Provider
            value={{
                setPropertyId: (id: number) => setPropertyId(id),
                setPropertyName: (name: string) => setPropertyName(name),
                showWinnerAlert,
                hideWinnerAlert,
                isAlertOpen,
                currentAuctionId,
                handleAuctionEnd,
            }}
        >
            {children}
            {/* Winner Alert with calendar context integration */}
            {isAlertOpen && currentAuctionId && (
                <WinnerAlert
                    user_id={currentUserId}
                    isOpen={isAlertOpen}
                    onConfirm={handlePaymentConfirm} // Pass selected bookings to payment handler
                    onDecline={handleDecline}
                    auctionId={currentAuctionId}
                    // allowPartial={allowPartial} // Pass allow_partial from calendar context
                />
            )}
        </WinnerContext.Provider>
    );
};

// Hook to use Winner Context
export const useWinner = (): WinnerContextType => {
    const context = useContext(WinnerContext);
    if (!context) {
        throw new Error('useWinner must be used within a WinnerProvider');
    }
    return context;
};