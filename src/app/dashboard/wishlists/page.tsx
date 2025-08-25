"use client"

import { useState, useEffect, useCallback } from "react"
import { PaginatedPropertyGrid } from "@/components/traveller/paginated-property-grid"
import { useWishlist } from "@/hooks/use-wishlist"
import { useAuth } from "@/contexts/auth-context"
import { PropertyCard } from "@/types"

export default function WishlistsPage() {
  const { user } = useAuth()
  const [userId] = useState(Number(user?.id || 1))
  const { 
    properties: wishlistProperties, 
    error, 
    isLoading, 
    fetchProperties, 
    currentPage,
    totalPages,
    total,
    hasNext,
    hasPrev
  } = useWishlist(userId, true)
  
  const [page, setPage] = useState(1)
  const [localProperties, setLocalProperties] = useState<PropertyCard[]>(wishlistProperties)

  // Sync localProperties with wishlistProperties when they change
  useEffect(() => {
    console.log('WishlistsPage: Syncing localProperties with wishlistProperties', wishlistProperties)
    setLocalProperties(wishlistProperties)
  }, [wishlistProperties])

  useEffect(() => {
    console.log('WishlistsPage: Fetching properties for user:', userId, 'page:', page)
    fetchProperties(page)
      .then(() => console.log('WishlistsPage: Properties fetched:', wishlistProperties))
      .catch(err => console.error('WishlistsPage: Error fetching properties:', err))
  }, [fetchProperties, page, userId])

  const onPageChange = useCallback((newPage: number) => {
    console.log('WishlistsPage: Changing to page:', newPage)
    setPage(newPage)
  }, [])

  const onNext = useCallback(() => {
    if (hasNext) {
      console.log('WishlistsPage: Navigating to next page')
      setPage(prev => prev + 1)
    }
  }, [hasNext])

  const onPrev = useCallback(() => {
    if (hasPrev) {
      console.log('WishlistsPage: Navigating to previous page')
      setPage(prev => prev - 1)
    }
  }, [hasPrev])

  // Handle toggle to update localProperties without API calls
  const handleToggleFavorite = useCallback((propertyId: string) => {
    console.log('WishlistsPage: Handling toggle for propertyId:', propertyId)
    // Filter out the removed property from localProperties
    setLocalProperties(prev => {
      const updated = prev.filter(p => p.id !== propertyId)
      console.log('WishlistsPage: Updated localProperties after toggle:', updated)
      return updated
    })
  }, [])

  console.log('WishlistsPage: Render state:', { 
    isLoading, 
    error, 
    propertiesLength: localProperties.length, 
    properties: localProperties.map(p => ({ id: p.id, title: p.title })), 
    currentPage,
    page,
    totalPages,
    total,
    hasNext,
    hasPrev
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Lỗi tải danh sách yêu thích</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => fetchProperties(page)}
            className="bg-rose-500 text-white px-6 py-2 rounded-lg hover:bg-rose-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Danh sách yêu thích</h1>
        {localProperties.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 text-lg font-medium">Danh sách yêu thích trống.</p>
            <p className="text-gray-500 mt-2">Hãy thêm bất động sản vào danh sách yêu thích của bạn!</p>
          </div>
        ) : (
          <PaginatedPropertyGrid
            properties={localProperties}
            loading={isLoading}
            error={error}
            currentPage={page}
            totalPages={totalPages}
            total={total}
            hasNext={hasNext}
            hasPrev={hasPrev}
            onPageChange={onPageChange}
            onNext={onNext}
            onPrev={onPrev}
            onToggleFavorite={handleToggleFavorite}
            className="w-full"
          />
        )}
      </div>
    </main>
  )
}