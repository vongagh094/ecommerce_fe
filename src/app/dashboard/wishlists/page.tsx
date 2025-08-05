"use client";

import { useEffect } from "react";
import { PropertyGrid } from "@/components/traveller/property-grid";
import { useWishlist } from "@/hooks/use-wishlist";

const userId = 1; // Temporary hardcoded userId

export default function WishlistsPage() {
  const { properties, error, isLoading, fetchProperties, handleFavoriteToggle } = useWishlist(userId, true);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Danh sách yêu thích</h1>
        {isLoading ? (
          <div className="text-center py-8">
            <svg
              className="animate-spin h-8 w-8 text-blue-600 mx-auto"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <p className="text-lg font-medium text-gray-700 mt-2">Đang tải danh sách yêu thích...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 text-lg font-medium">{error}</p>
            <button
              onClick={() => fetchProperties()}
              className="mt-4 bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 text-lg font-medium">Danh sách yêu thích trống.</p>
            <p className="text-gray-500 mt-2">Hãy thêm bất động sản vào danh sách yêu thích của bạn!</p>
          </div>
        ) : (
          <PropertyGrid
            properties={properties}
            userId={userId}
            onFavoriteToggle={handleFavoriteToggle}
            setIsMessageModalOpen={(open) => console.log("Message modal open:", open)}
          />
        )}
      </div>
    </main>
  );
}