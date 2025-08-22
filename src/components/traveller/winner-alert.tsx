import React, { useState, useEffect } from 'react';
import { Trophy, Check, X, Loader2, AlertCircle, Calendar, CreditCard, Users, Minus, Plus } from 'lucide-react';
import { useCalendarContext } from "@/contexts/calender-context";
import { WinnerData, ApiWinnerResponse, WinnerAlertProps } from "@/types/winner";

const WinnerAlert = ({
                         user_id,
                         isOpen,
                         onConfirm,
                         onDecline,
                         auctionId
                     }: WinnerAlertProps) => {
    const [winnerData, setWinnerData] = useState<WinnerData[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentUserId] = useState(user_id);
    const [selectedBookings, setSelectedBookings] = useState<string[]>([]);
    const [paymentStrategy, setPaymentStrategy] = useState<'select' | 'all' | null>(null);

    // Guest Count State
    const [guestCount, setGuestCount] = useState(1);
    const [showGuestInput, setShowGuestInput] = useState(false);
    const minGuests = 1;
    const maxGuests = 20;

    // Get allowPartial from Calendar Context
    const { allowPartial } = useCalendarContext();
    console.log('Allow partial from calendar context:', allowPartial);
    // Transform API response to internal format
    const transformApiResponse = (apiData: ApiWinnerResponse[]): WinnerData[] => {
        if (!Array.isArray(apiData)) {
            console.warn('API data is not an array:', apiData);
            return [];
        }

        return apiData.map((item, index) => {
            // Calculate nights between dates
            const checkIn = new Date(item.check_in_win);
            const checkOut = new Date(item.check_out_win);
            const timeDiff = checkOut.getTime() - checkIn.getTime();
            const nights = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));

            return {
                id: `${item.auction_id}-${item.user_id}-${index}`, // Generate unique ID
                user_id: item.user_id,
                auction_id: item.auction_id,
                check_in_date: item.check_in_win,
                check_out_date: item.check_out_win,
                total_amount: item.amount || 0,
                guest_count: 1, // Default guest count, will be updated when user confirms
                nights: nights
            };
        });
    };

    const checkWinnerStatus = async () => {
        if (!isOpen || !auctionId) return;

        setLoading(true);
        try {
            const baseUrl = 'http://localhost:8000';
            const response = await fetch(`${baseUrl}/winner/${auctionId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const apiData = await response.json();
                console.log('Raw API response:', apiData);
                console.log('Current user ID:', currentUserId);
                console.log('Allow partial from calendar context:', allowPartial);

                // Filter API data for current user
                let userApiWins: ApiWinnerResponse[] = [];
                if (Array.isArray(apiData)) {
                    userApiWins = apiData.filter((item: ApiWinnerResponse) =>
                        item && item.user_id === currentUserId
                    );
                } else {
                    console.warn('API response is not an array:', apiData);
                    userApiWins = [];
                }

                console.log('User API wins:', userApiWins);

                // Transform API response to internal format
                const transformedData = transformApiResponse(userApiWins);
                console.log('Transformed data:', transformedData);

                // If user doesn't allow partial bookings
                let finalData = transformedData;
                if (!allowPartial) {
                    console.log('User does not allow partial bookings');
                }

                setWinnerData(finalData);
                console.log('Final winner data:', finalData);

                // Auto select all if only 1 booking
                if (finalData.length === 1) {
                    setSelectedBookings([finalData[0].id]);
                }
            } else {
                console.error('API response not OK:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error checking winner:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            checkWinnerStatus();
        }
    }, [isOpen, auctionId]);

    useEffect(() => {
        // Reset states when modal closes
        if (!isOpen) {
            setSelectedBookings([]);
            setPaymentStrategy(null);
            setWinnerData([]);
            setGuestCount(1);
            setShowGuestInput(false);
        }
    }, [isOpen]);

    const formatCurrency = (amount: number | undefined | null) => {
        if (amount === undefined || amount === null || isNaN(amount)) {
            return '₫0';
        }
        return `₫${amount.toLocaleString()}`;
    };

    const formatDate = (dateString: string | undefined | null) => {
        if (!dateString) {
            return 'N/A';
        }
        try {
            return new Date(dateString).toLocaleDateString('vi-VN');
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    };

    const totalSelectedAmount = selectedBookings.reduce((sum, bookingId) => {
        const booking = winnerData.find(w => w.id === bookingId);
        const amount = booking?.total_amount || 0;
        return sum + amount;
    }, 0);

    const totalAllAmount = winnerData.reduce((sum, booking) => {
        const amount = booking?.total_amount || 0;
        return sum + amount;
    }, 0);

    const handleBookingSelection = (bookingId: string, checked: boolean) => {
        if (checked) {
            setSelectedBookings([...selectedBookings, bookingId]);
        } else {
            setSelectedBookings(selectedBookings.filter(id => id !== bookingId));
        }
    };

    const handlePaymentStrategySelect = (strategy: 'select' | 'all') => {
        setPaymentStrategy(strategy);
        if (strategy === 'all') {
            setSelectedBookings(winnerData.map(w => w.id));
        } else {
            setSelectedBookings([]);
        }
    };

    // Guest Count Handlers
    const handleIncrementGuest = () => {
        if (guestCount < maxGuests) {
            setGuestCount(guestCount + 1);
        }
    };

    const handleDecrementGuest = () => {
        if (guestCount > minGuests) {
            setGuestCount(guestCount - 1);
        }
    };

    const handleGuestInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || minGuests;
        const clampedValue = Math.max(minGuests, Math.min(maxGuests, value));
        setGuestCount(clampedValue);
    };

    // Main confirm handler - shows guest input modal
    const handleConfirm = () => {
        if (selectedBookings.length === 0) {
            alert('Vui lòng chọn ít nhất một booking để thanh toán');
            return;
        }

        // Show guest input modal
        setShowGuestInput(true);
    };

    // Final confirm with guest count
    const handleGuestConfirm = () => {
        const selectedData = winnerData
            .filter(w => selectedBookings.includes(w.id))
            .map(booking => ({
                ...booking,
                guest_count: guestCount // Update guest count for selected bookings
            }));

        console.log('Selected bookings for payment:', selectedData);
        console.log('Guest count:', guestCount);
        console.log('Allow partial setting:', allowPartial);

        // Hide guest input modal
        setShowGuestInput(false);

        // Pass updated data to parent
        onConfirm(selectedData);
    };

    if (!isOpen) return null;

    const isWinner = winnerData.length > 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 transform animate-in duration-200 ease-out slide-in-from-bottom-4 max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className={`p-6 text-center border-b ${isWinner ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-gray-50'}`}>
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 ${
                        isWinner ? 'bg-yellow-100' : 'bg-gray-100'
                    }`}>
                        {loading ? (
                            <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
                        ) : (
                            <Trophy className={`w-8 h-8 ${isWinner ? 'text-yellow-600' : 'text-gray-600'}`} />
                        )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Đấu Giá Kết Thúc!
                    </h3>

                    <p className="text-sm text-gray-600">
                        Auction ID: {auctionId.slice(0, 8)}...
                    </p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-4">
                            <p className="text-gray-600">Đang kiểm tra kết quả...</p>
                        </div>
                    ) : isWinner ? (
                        <div>
                            {/* Winner Summary */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Trophy className="w-5 h-5 text-green-600" />
                                    <span className="font-semibold text-green-800">🎉 Chúc mừng!</span>
                                </div>
                                <p className="text-green-700 text-sm text-center">
                                    Bạn đã thắng {winnerData.length} booking!
                                </p>
                                {!allowPartial && (
                                    <div className="flex items-center justify-center gap-1 mt-2">
                                        <AlertCircle className="w-4 h-4 text-blue-500" />
                                        <span className="text-xs text-blue-600">
                                            Chế độ: Chỉ booking toàn bộ
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Payment Strategy Selection */}
                            {winnerData.length > 1 && paymentStrategy === null ? (
                                <div className="space-y-3 mb-4">
                                    <p className="text-gray-700 font-medium text-center">
                                        Chọn cách thức thanh toán:
                                    </p>
                                    <div className="space-y-2">
                                        {allowPartial ? (
                                            <button
                                                className="w-full p-3 border-2 border-green-200 rounded-lg text-left hover:bg-green-50 hover:border-green-300 transition-colors"
                                                onClick={() => handlePaymentStrategySelect('all')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="w-5 h-5 text-green-600" />
                                                    <div className="flex-1">
                                                        <div className="font-medium text-green-800">Thanh toán tất cả</div>
                                                        <div className="text-sm text-green-600">
                                                            Tổng: {formatCurrency(totalAllAmount)} - Tiện lợi và nhanh chóng
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ) : (
                                            <p className="text-xs text-orange-700">
                                                Do bạn đã chọn "Không cho phép đặt một phần", một số ngày trong khoảng thời gian đặt phòng có thể đã được người khác thắng.
                                            </p>
                                            )}
                                        <button
                                            className="w-full p-3 border-2 border-blue-200 rounded-lg text-left hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                            onClick={() => handlePaymentStrategySelect('select')}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Check className="w-5 h-5 text-blue-600" />
                                                <div className="flex-1">
                                                    <div className="font-medium text-blue-800">Chọn từng booking</div>
                                                    <div className="text-sm text-blue-600">
                                                        Linh hoạt thanh toán theo nhu cầu
                                                    </div>
                                                </div>
                                            </div>
                                        </button>

                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Booking Selection */}
                                    {(paymentStrategy === 'select' || winnerData.length === 1) && (
                                        <div className="space-y-3 mb-4">
                                            {winnerData.length > 1 && (
                                                <div className="flex items-center justify-between">
                                                    <p className="text-gray-700 font-medium">
                                                        Chọn booking muốn thanh toán:
                                                    </p>
                                                    <button
                                                        onClick={() => setPaymentStrategy(null)}
                                                        className="text-sm text-blue-600 hover:text-blue-800"
                                                    >
                                                        Đổi cách thức
                                                    </button>
                                                </div>
                                            )}

                                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                                {winnerData.map((booking, index) => (
                                                    <div key={booking.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedBookings.includes(booking.id)}
                                                            onChange={(e) => handleBookingSelection(booking.id, e.target.checked)}
                                                            className="w-4 h-4 text-green-600 rounded"
                                                        />
                                                        <Calendar className="w-4 h-4 text-gray-500" />
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-medium text-sm">
                                                                    {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                                                                </p>
                                                                {!allowPartial && (
                                                                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                                                        Toàn bộ
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600">
                                                                {booking.nights || 0} đêm - {formatCurrency(booking.total_amount)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {selectedBookings.length > 0 && (
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium text-blue-800">
                                                            Đã chọn {selectedBookings.length} booking
                                                        </span>
                                                        <span className="font-bold text-blue-900">
                                                            {formatCurrency(totalSelectedAmount)}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* All Bookings Summary */}
                                    {paymentStrategy === 'all' && (
                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-center justify-between">
                                                <p className="text-gray-700 font-medium">
                                                    Tất cả booking của bạn:
                                                </p>
                                                <button
                                                    onClick={() => setPaymentStrategy(null)}
                                                    className="text-sm text-blue-600 hover:text-blue-800"
                                                >
                                                    Đổi cách thức
                                                </button>
                                            </div>

                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                <div className="space-y-2">
                                                    {winnerData.map((booking, index) => (
                                                        <div key={booking.id} className="flex justify-between items-center text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="w-3 h-3 text-gray-500" />
                                                                <span>
                                                                    {formatDate(booking.check_in_date)} - {formatDate(booking.check_out_date)}
                                                                </span>
                                                            </div>
                                                            <span className="font-medium text-green-700">
                                                                {formatCurrency(booking.total_amount)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    <div className="border-t border-green-200 pt-2 flex justify-between items-center font-bold text-green-800">
                                                        <span>Tổng cộng:</span>
                                                        <span>{formatCurrency(totalAllAmount)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <p className="text-blue-800 font-medium mb-1">Đấu giá đã hoàn thành</p>
                                <p className="text-blue-600 text-sm">
                                    Rất tiếc, bạn không chiến thắng lần này
                                </p>
                            </div>

                            {!allowPartial && (
                                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="w-4 h-4 text-orange-500" />
                                        <span className="text-sm font-medium text-orange-800">
                                            Lưu ý về đặt phòng một phần
                                        </span>
                                    </div>
                                    <p className="text-xs text-orange-700">
                                        Do bạn đã chọn "Không cho phép đặt một phần", một số ngày trong khoảng thời gian đặt phòng có thể đã được người khác thắng.
                                        Để tăng cơ hội thắng, hãy chọn "Cho phép đặt một phần" trong lần đấu giá tiếp theo.
                                    </p>
                                </div>
                            )}

                            <p className="text-gray-600 text-sm mb-4 mt-4">
                                Cảm ơn bạn đã tham gia đấu giá!
                            </p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="p-4 bg-gray-50 rounded-b-2xl flex gap-3">
                    <button
                        onClick={onDecline}
                        className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                        {isWinner ? 'Để sau' : 'Đóng'}
                    </button>

                    {isWinner ? (
                        <button
                            onClick={handleConfirm}
                            disabled={selectedBookings.length === 0}
                            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium ${
                                selectedBookings.length > 0
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {selectedBookings.length > 0
                                ? selectedBookings.length === 1
                                    ? `Thanh Toán (${formatCurrency(totalSelectedAmount)})`
                                    : `Thanh Toán ${selectedBookings.length} Booking (${formatCurrency(totalSelectedAmount)})`
                                : 'Chọn Booking'
                            }
                        </button>
                    ) : (
                        <button
                            onClick={() => window.location.href = '/auctions'}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                            Tham Gia Đấu Giá Khác
                        </button>
                    )}
                </div>
            </div>

            {/* Guest Count Input Modal */}
            {showGuestInput && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
                        <div className="p-6 border-b">
                            <div className="flex items-center gap-2 mb-2">
                                <Users className="w-5 h-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Số lượng khách</h3>
                            </div>
                            <p className="text-sm text-gray-600">
                                Vui lòng nhập số lượng khách cho booking này
                            </p>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                {/* Guest Count Input */}
                                <div className="flex items-center gap-3 justify-center">
                                    <button
                                        onClick={handleDecrementGuest}
                                        disabled={guestCount <= minGuests}
                                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>

                                    <div className="flex-1 max-w-24">
                                        <input
                                            type="number"
                                            min={minGuests}
                                            max={maxGuests}
                                            value={guestCount}
                                            onChange={handleGuestInputChange}
                                            className="w-full text-center text-lg font-semibold border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            style={{
                                                MozAppearance: 'textfield',
                                                WebkitAppearance: 'none',
                                            }}
                                        />
                                    </div>

                                    <button
                                        onClick={handleIncrementGuest}
                                        disabled={guestCount >= maxGuests}
                                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                <p className="text-xs text-gray-500 text-center">
                                    Tối thiểu {minGuests}, tối đa {maxGuests} khách
                                </p>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-sm text-blue-800">
                                        <strong>Booking đã chọn:</strong> {selectedBookings.length} booking
                                    </p>
                                    <p className="text-sm text-blue-700">
                                        <strong>Tổng tiền:</strong> {formatCurrency(totalSelectedAmount)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-b-2xl flex gap-3">
                            <button
                                onClick={() => setShowGuestInput(false)}
                                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleGuestConfirm}
                                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                            >
                                Tiếp tục thanh toán
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WinnerAlert;