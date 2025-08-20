"use client"
import {useState} from "react";
import {useWinLossStatusPolling} from "@/hooks/use-calendar";

export const CalendarBiddingFeature = ({
                                           propertyId,
                                           auctionId,
                                           userId,
                                           pollingInterval = 15000
                                       }: {
    propertyId: number;
    auctionId: string;
    userId: number;
    pollingInterval?: number;
}) => {
    // Win/Loss polling
    const {
        winLossData,
        countdown: winLossCountdown,
        loading: winLossLoading,
        error: winLossError,
        lastUpdated: winLossLastUpdated,
        refetch
    } = useWinLossStatusPolling(auctionId, userId, propertyId, pollingInterval);

    // Format price
    const formatPrice = (price: number) => {
        return `₫${price.toLocaleString()}`;
    };

    // Loading state
    if (winLossLoading && !winLossData) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Loading win/loss status...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
            {/* Header with countdown */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Bid Status Monitor
                </h2>

                {/* Countdown Timer */}
                <div className="flex items-center space-x-4">
                    <div className="bg-green-50 px-4 py-2 rounded-lg">
                        <div className="text-sm text-green-600 font-medium">Auto Update</div>
                        <div className="text-lg font-bold text-green-800">{winLossCountdown}s</div>
                        {winLossLastUpdated && (
                            <div className="text-xs text-green-500">Last: {winLossLastUpdated}</div>
                        )}
                    </div>

                    {/* Manual refresh button */}
                    <button
                        onClick={refetch}
                        disabled={winLossLoading}
                        className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                        title="Refresh now"
                    >
                        <svg className={`w-5 h-5 ${winLossLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {winLossError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-red-800 mb-1">Error:</h4>
                    <p className="text-red-600 text-sm">{winLossError}</p>
                </div>
            )}

            {/* No Bid Message */}
            {winLossData && !winLossData.has_bid && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <p className="text-gray-600">You have not placed any bids yet.</p>
                </div>
            )}

            {/* Win/Loss Summary */}
            {winLossData?.has_bid && winLossData.summary && (
                <>
                    {/* Main Summary Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Your Current Bid</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    <span className="font-medium">{formatPrice(winLossData.user_bid?.price_per_night || 0)}/night</span>
                                </p>
                                <p className="text-sm text-gray-600">
                                    {winLossData.user_bid?.check_in} to {winLossData.user_bid?.check_out}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-bold text-blue-600">
                                    {winLossData.summary.win_rate.toFixed(1)}%
                                </div>
                                <div className="text-sm text-gray-600 font-medium">Win Rate</div>
                            </div>
                        </div>
                    </div>

                    {/* Status Breakdown */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-green-600 text-sm font-medium">Winning Nights</div>
                                    <div className="text-2xl font-bold text-green-700 mt-1">
                                        {winLossData.summary.winning_nights}
                                    </div>
                                </div>
                                <div className="text-3xl">🟢</div>
                            </div>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-red-600 text-sm font-medium">Losing Nights</div>
                                    <div className="text-2xl font-bold text-red-700 mt-1">
                                        {winLossData.summary.losing_nights}
                                    </div>
                                </div>
                                <div className="text-3xl">🔴</div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Day-by-Day Comparison */}
                    {winLossData.comparison && Object.keys(winLossData.comparison).length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                <h4 className="font-medium text-gray-900">Day-by-Day Comparison</h4>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {Object.entries(winLossData.comparison).map(([date, status]) => (
                                    <div key={date} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-lg">
                                                {status.is_winning ? '🟢' : '🔴'}
                                            </span>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {new Date(date).toLocaleDateString('en-US', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Your bid: {formatPrice(status.user_bid)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-600">
                                                Highest: {formatPrice(status.current_highest)}
                                            </div>
                                            <div className={`text-sm font-medium ${
                                                status.is_winning ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {status.difference > 0 ? '+' : ''}{formatPrice(Math.abs(status.difference))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Statistics Footer */}
                    <div className="mt-6 grid grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-sm text-gray-600">Total Nights</div>
                            <div className="text-xl font-bold text-gray-900">
                                {winLossData.summary.total_nights}
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-sm text-gray-600">Total Bid</div>
                            <div className="text-xl font-bold text-gray-900">
                                {formatPrice(winLossData.user_bid?.total_amount || 0)}
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-sm text-gray-600">Status</div>
                            <div className="text-xl font-bold">
                                {winLossData.summary.win_rate >= 50 ?
                                    <span className="text-green-600">Favorable</span> :
                                    <span className="text-red-600">At Risk</span>
                                }
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Loading overlay for updates */}
            {winLossLoading && winLossData && (
                <div className="fixed top-4 right-4 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Updating...</span>
                </div>
            )}
        </div>
    );
};