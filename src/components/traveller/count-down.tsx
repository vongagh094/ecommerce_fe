import { Clock, Play, AlertTriangle } from 'lucide-react';
import {useAuctionCountdown} from "@/hooks/use-countdown";
import {auctionAPI} from "@/lib/auction-service"
import {useEffect, useRef} from "react";
// Simple countdown component
interface SimpleCountdownProps {
    auction_id: string,
    auctionStartTime: string;
    auctionEndTime: string;
    className?: string;
    onStatusUpdate?: (newStatus: string) => void; // Optional callback
    onRefetch?: () => void; // Optional refetch callback
}


export const SimpleCountdown: React.FC<SimpleCountdownProps> = ({
                                                                    auction_id,
                                                                    auctionStartTime,
                                                                    auctionEndTime,
                                                                    className = "",
                                                                    onStatusUpdate,
                                                                    onRefetch
                                                                }) => {
    const { timeLeft, isStarted, isEnded, displayText } = useAuctionCountdown(
        auctionStartTime,
        auctionEndTime
    );
    // Ref để track xem đã update status chưa
    const hasUpdatedStatus = useRef(false);
    const previousIsEnded = useRef(false);

    // Format time với leading zero
    const formatTime = (value: number): string => {
        return value.toString().padStart(2, '0');
    };

    // Hàm update status - TÁCH RA KHỎI RENDER
    const handleUpdateStatus = async (status: string) => {
        if (hasUpdatedStatus.current) return; // Tránh gọi nhiều lần

        hasUpdatedStatus.current = true;

        try {
            console.log(`Updating auction ${auction_id} status to ${status}`);
            const result = await auctionAPI.updateAuctionStatus(auction_id, status);
            console.log('Update result:', result);

            // Gọi callbacks nếu có
            onStatusUpdate?.(status);

            // Delay nhỏ rồi refetch
            setTimeout(() => {
                onRefetch?.();
            }, 500);

        } catch (e) {
            console.log("count-down.tsx error", e);
            hasUpdatedStatus.current = false; // Reset để có thể thử lại
        }
    }

    // Effect để theo dõi khi auction kết thúc
    useEffect(() => {
        // Chỉ update khi isEnded thay đổi từ false sang true
        if (isEnded && !previousIsEnded.current) {
            handleUpdateStatus("COMPLETED");
        }

        previousIsEnded.current = isEnded;
    }, [isEnded, auction_id]);

    // Reset hasUpdatedStatus khi auction_id thay đổi
    useEffect(() => {
        hasUpdatedStatus.current = false;
        previousIsEnded.current = false;
    }, [auction_id]);
    // Format display time
    const formatDisplayTime = (): string => {
        if (isEnded) return "Ended";
        const parts = [];

        if (timeLeft.days > 0) {
            parts.push(`${timeLeft.days}d`);
        }
        if (timeLeft.hours > 0 || timeLeft.days > 0) {
            parts.push(`${formatTime(timeLeft.hours)}h`);
        }
        parts.push(`${formatTime(timeLeft.minutes)}m`);
        parts.push(`${formatTime(timeLeft.seconds)}s`);


        return parts.join(' ');
    };

    // Style theo trạng thái
    const getStatusStyle = () => {
        if (isEnded) {
            return "text-gray-500 bg-gray-50 border-gray-200";
        } else if (isStarted) {
            return "text-red-600 bg-red-50 border-red-200";
        } else {
            return "text-blue-600 bg-blue-50 border-blue-200";
        }
    };

    const Icon = isStarted ? Clock : Play;

    return (
        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium ${getStatusStyle()} ${className}`}>
            <Icon className="h-3 w-3" />
            <span>{displayText}</span>
            {!isEnded && <span>{formatDisplayTime()}</span>}
        </div>
    );
};

// // Usage example trong auction card
// export const AuctionCardWithSimpleCountdown: React.FC<{
//     auction: any;
//     onClick?: () => void;
//     isSelected?: boolean;
// }> = ({ auction, onClick, isSelected }) => {
//     const formatCurrency = (amount: number) => {
//         return `${amount.toLocaleString()} đ`;
//     };
//
//     return (
//         <button
//             onClick={onClick}
//             className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
//                 isSelected
//                     ? 'border-blue-500 bg-blue-50'
//                     : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//             }`}
//         >
//             {/* Header với countdown */}
//             <div className="flex items-center justify-between mb-3">
//                 <h4 className="font-medium text-gray-900">Property #{auction.property_id}</h4>
//                 <SimpleCountdown
//                     auctionStartTime={auction.auction_start_time}
//                     auctionEndTime={auction.auction_end_time}
//                 />
//             </div>
//
//             {/* Auction info */}
//             <div className="grid grid-cols-3 gap-4 text-sm">
//                 <div>
//                     <div className="text-xs text-gray-500">Starting Price</div>
//                     <div className="font-medium text-gray-900">
//                         {formatCurrency(auction.starting_price)}
//                     </div>
//                 </div>
//
//                 <div>
//                     <div className="text-xs text-gray-500">Current Highest</div>
//                     <div className="font-medium text-green-600">
//                         {auction.current_highest_bid
//                             ? formatCurrency(auction.current_highest_bid)
//                             : 'No bids'
//                         }
//                     </div>
//                 </div>
//
//                 <div>
//                     <div className="text-xs text-gray-500">Total Bids</div>
//                     <div className="font-medium text-blue-600">
//                         {auction.total_bids}
//                     </div>
//                 </div>
//             </div>
//         </button>
//     );
// };

export default SimpleCountdown;