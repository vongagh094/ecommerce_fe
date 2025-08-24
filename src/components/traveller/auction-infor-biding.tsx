"use client"
import React, {useState, useEffect, useCallback} from 'react';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';
// FIX: Import đúng component
import {SimpleCountdown} from "@/components/traveller/count-down";
import { AuctionInfo } from '@/types/auction';
import {useAuctionCalendarContext} from "@/contexts/auction-calendar-context";
import {useCalendarContext} from "@/contexts/calender-context";

interface SimpleAuctionSelectorProps {
    propertyId: number;
    onAuctionSelect?: (auction: AuctionInfo) => void;
}

const SimpleAuctionSelector: React.FC<SimpleAuctionSelectorProps> = ({ propertyId, onAuctionSelect }) => {
    const [auctions, setAuctions] = useState<AuctionInfo[]>([]);
    const {selectedAuction, setSelectedAuction} = useAuctionCalendarContext();
    const [loading, setLoading] = useState(true);
    const {selectedDates, setSelectedDates} = useCalendarContext();

    // FIX: Move fetchAuctions ra ngoài useEffect để có thể dùng trong callback
    const fetchAuctions = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8000/auctions/property/${propertyId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch auctions');
            }

            const data = await response.json();

            // Filter chỉ lấy ACTIVE và PENDING auctions
            const availableAuctions = data.filter((auction: AuctionInfo) =>
                auction.status === 'ACTIVE' || auction.status === 'PENDING'
            );

            setAuctions(availableAuctions);

            // Auto-select first auction
            if (availableAuctions.length > 0 && !selectedAuction) {
                setSelectedAuction(availableAuctions[0]);
                onAuctionSelect?.(availableAuctions[0]);
            }

        } catch (error) {
            console.error('Error fetching auctions:', error);

            // Fallback to mock data nếu API fail - filter by propertyId
            const mockData = [
                {
                    "id": "22222222-2222-2222-2222-222222222222",
                    "property_id": 11798,
                    "start_date": "2025-08-18",
                    "end_date": "2025-08-25",
                    "min_nights": 3,
                    "max_nights": 7,
                    "starting_price": 70,
                    "bid_increment": 5,
                    "minimum_bid": 70,
                    "auction_start_time": "2025-08-12T09:00:00",
                    "auction_end_time": "2025-08-17T20:00:00",
                    "objective": "HIGHEST_PER_NIGHT",
                    "status": "ACTIVE" as const,
                    "total_bids": 5,
                    "current_highest_bid": 85,
                    "created_at": "2025-08-16T01:13:27.182742"
                },
                {
                    "id": "77777777-7777-7777-7777-777777777777",
                    "property_id": 11798,
                    "start_date": "2025-09-01",
                    "end_date": "2025-09-15",
                    "min_nights": 1,
                    "max_nights": 5,
                    "starting_price": 55,
                    "bid_increment": 5,
                    "minimum_bid": 55,
                    "auction_start_time": "2025-08-25T12:00:00",
                    "auction_end_time": "2025-08-29T18:00:00",
                    "objective": "HIGHEST_PER_NIGHT",
                    "status": "PENDING" as const,
                    "total_bids": 0,
                    "current_highest_bid": null,
                    "created_at": "2025-08-16T04:23:24.504521"
                }
            ].filter(auction => auction.property_id === propertyId);

            setAuctions(mockData);
            if (mockData.length > 0 && !selectedAuction) {
                setSelectedAuction(mockData[0]);
                onAuctionSelect?.(mockData[0]);
            }
        } finally {
            setLoading(false);
        }
    }, [propertyId, onAuctionSelect, selectedAuction, setSelectedAuction]);

    // useEffect để gọi fetchAuctions
    useEffect(() => {
        if (propertyId) {
            fetchAuctions();
        }
    }, [propertyId, fetchAuctions]);

    const handleAuctionSelect = (auction: AuctionInfo) => {
        setSelectedAuction(auction);
        onAuctionSelect?.(auction);
        setSelectedDates([])
    };

    const formatCurrency = (amount: number) => {
        return `${amount.toLocaleString()} đ`;
    };

    // Callback khi status auction thay đổi
    const handleStatusUpdate = useCallback((auctionId: string, newStatus: string) => {
        console.log(`Auction ${auctionId} status updated to ${newStatus}`);

        // Type assertion để đảm bảo newStatus là valid status
        const validStatus = newStatus as AuctionInfo['status'];

        // Update local state
        setAuctions(prev => prev.map(auction =>
            auction.id === auctionId
                ? { ...auction, status: validStatus }
                : auction
        ).filter(auction =>
            // Filter out COMPLETED auctions
            auction.status === 'ACTIVE' || auction.status === 'PENDING' || auction.status === 'activate'
        ));

        // Clear selection if completed
        if (selectedAuction?.id === auctionId && newStatus === 'COMPLETED') {
            setSelectedAuction(null);
        }
    }, [selectedAuction, setSelectedAuction]);

    // Callback để refetch data
    const handleRefetch = useCallback(() => {
        console.log('Refetching auctions...');
        fetchAuctions();
    }, [fetchAuctions]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status: string) => {
        const isActive = status === 'ACTIVE' || status === 'activate';
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                isActive
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
            }`}>
                {isActive ? 'Đang diễn ra' : 'Sắp bắt đầu'}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-gray-200 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
                <Calendar className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Available Auctions</h3>
            </div>

            <div className="space-y-3">
                {auctions.map((auction) => (
                    <button
                        key={auction.id}
                        onClick={() => handleAuctionSelect(auction)}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                            selectedAuction?.id === auction.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            {getStatusBadge(auction.status)}

                            {/* FIX: Sửa lỗi syntax */}
                            <SimpleCountdown
                                auction_id={auction.id}
                                auctionStartTime={auction.auction_start_time}
                                auctionEndTime={auction.auction_end_time}
                                onStatusUpdate={(newStatus) => handleStatusUpdate(auction.id, newStatus)}
                                onRefetch={handleRefetch}
                            />
                        </div>

                        <div className="flex items-center space-x-1 text-sm text-gray-600 mb-3">
                            <MapPin className="h-3 w-3" />
                            <span>Min: {auction.min_nights} nights • Max: {auction.max_nights} nights</span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <span className="text-gray-600">
                                    {formatDate(auction.start_date)} - {formatDate(auction.end_date)}
                                </span>
                            </div>

                            <div className="flex items-center space-x-1">
                                <DollarSign className="h-3 w-3 text-green-500" />
                                <span className="text-green-600 font-medium">
                                    {auction.current_highest_bid ? formatCurrency(auction.current_highest_bid) : formatCurrency(auction.starting_price)}
                                </span>
                            </div>

                            <div className="flex items-center space-x-1">
                                <Users className="h-3 w-3 text-blue-500" />
                                <span className="text-blue-600 font-medium">
                                    {auction.total_bids} bids
                                </span>
                            </div>
                        </div>

                        {/* Additional info */}
                        <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Starting: {formatCurrency(auction.starting_price)}</span>
                                <span>Min bid: {formatCurrency(auction.minimum_bid)}</span>
                                <span>Increment: +{formatCurrency(auction.bid_increment)}</span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SimpleAuctionSelector;