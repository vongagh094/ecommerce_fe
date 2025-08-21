import React, { useState, useEffect } from 'react';
import { Trophy, Check, X, Loader2 } from 'lucide-react';
import {useAuth} from "@/contexts/auth-context";
interface WinnerAlertProps {
    user_id: number;
    isOpen: boolean;
    onConfirm: () => void;
    onDecline: () => void;
    auctionId: string;
}

const WinnerAlert = ({ user_id,isOpen, onConfirm, onDecline, auctionId }: WinnerAlertProps) => {
    const [winnerData, setWinnerData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentUserId] = useState(user_id);
    // const {user} = useAuth();

    // Quick API check để xem user có thắng không
    const checkWinnerStatus = async () => {
        if (!isOpen || !auctionId) return;

        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/winner/api/auction/winners/${auctionId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Winner data:', data);
                const userWins = Array.isArray(data) ? data.filter(win => win.user_id === currentUserId) : [];
                // @ts-ignore
                setWinnerData(userWins);
                console.log('User Wins:', userWins);
                console.log('Winner data:', data);
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

    if (!isOpen) return null;

    const isWinner = winnerData.length > 0;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
                {/* Alert Box */}
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform animate-in duration-200 ease-out slide-in-from-bottom-4">

                    {/* Header với icon */}
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
                            <div className="text-center">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Trophy className="w-5 h-5 text-green-600" />
                                        <span className="font-semibold text-green-800">🎉 Chúc mừng!</span>
                                    </div>
                                    <p className="text-green-700 text-sm">
                                        Bạn đã chiến thắng với {winnerData.length} booking!
                                    </p>
                                </div>

                                <p className="text-gray-600 text-sm mb-4">
                                    Bạn có muốn xem chi tiết kết quả đấu giá không?
                                </p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <p className="text-blue-800 font-medium mb-1">Đấu giá đã hoàn thành</p>
                                    <p className="text-blue-600 text-sm">
                                        Rất tiếc, bạn không chiến thắng lần này
                                    </p>
                                </div>

                                <p className="text-gray-600 text-sm mb-4">
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

                        <button
                            onClick={onConfirm}
                            className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium ${
                                isWinner
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {isWinner ? 'Xem Chi Tiết' : 'Tham Gia Khác'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default WinnerAlert;