"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import WinnerAlert from '@/components/traveller/winner-alert'; // Import alert component

interface WinnerContextType {
    setCurrenUserId: (userId: number) => void;
    showWinnerAlert: (auctionId: string) => void;
    hideWinnerAlert: () => void;
    isAlertOpen: boolean;
    currentAuctionId: string | null;
}

const WinnerContext = createContext<WinnerContextType | undefined>(undefined);

interface WinnerProviderProps {
    children: ReactNode;
}

export const WinnerProvider: React.FC<WinnerProviderProps> = ({ children }) => {
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [currentAuctionId, setCurrentAuctionId] = useState<string | null>(null);
    const router = useRouter();
    const [currentUserId, setCurrentUserId] = useState<number>(1);


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

    const handleConfirm = () => {
        console.log('User confirmed - navigating to winner details');
        hideWinnerAlert();

        // Navigate đến trang chi tiết winner
        if (currentAuctionId) {
            router.push(`/winner-notification?auction_id=${currentAuctionId}`);
        }
    };

    const handleDecline = () => {
        console.log('User declined - closing alert');
        hideWinnerAlert();

        // Có thể navigate về trang chính hoặc làm gì đó khác
        // router.push('/auctions'); // Optional
    };

    return (
        <WinnerContext.Provider
            value={{
                setCurrenUserId: setCurrentUserId,
                showWinnerAlert,
                hideWinnerAlert,
                isAlertOpen,
                currentAuctionId,
            }}
        >
            {children}
            {/* Winner Alert - nhỏ gọn hiện giữa màn hình */}
            {isAlertOpen && currentAuctionId && (
                <WinnerAlert
                    user_id = {currentUserId}
                    isOpen={isAlertOpen}
                    onConfirm={handleConfirm}
                    onDecline={handleDecline}
                    auctionId={currentAuctionId}
                />
            )}
        </WinnerContext.Provider>
    );
};

// Hook để sử dụng Winner Context
export const useWinner = (): WinnerContextType => {
    const context = useContext(WinnerContext);
    if (!context) {
        throw new Error('useWinner must be used within a WinnerProvider');
    }
    return context;
};