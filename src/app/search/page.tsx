"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { SearchSection } from "@/components/traveller/search-section"
import { CategoryFilters } from "@/components/traveller/category-filters"
import { EnhancedPropertyGrid } from "@/components/traveller/enhanced-property-grid"
import { usePropertySearch } from "@/hooks/use-property-search"
import { SearchParams, FilterParams } from "@/types"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const { 
    displayedProperties, 
    loading, 
    error, 
    hasMore, 
    canShowMore, 
    total, 
    search, 
    filter, 
    loadMore, 
    showMore 
  } = usePropertySearch()
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize search from URL parameters
  useEffect(() => {
    if (!isInitialized) {
      const params: SearchParams = {
        location: searchParams.get('location') || undefined,
        check_in: searchParams.get('check_in') || undefined,
        check_out: searchParams.get('check_out') || undefined,
        guests: searchParams.get('guests') ? parseInt(searchParams.get('guests')!) : undefined,
      }

      // Check if we have a category filter
      const category = searchParams.get('category')
      if (category) {
        const filterParams: FilterParams = {
          ...params,
          categories: [category]
        }
        filter(filterParams)
      } else {
        // Remove undefined values
        const cleanParams = Object.fromEntries(
          Object.entries(params).filter(([_, value]) => value !== undefined)
        )
        
        if (Object.keys(cleanParams).length > 0) {
          search(cleanParams)
        }
      }
      
      setIsInitialized(true)
    }
  }, [searchParams, search, filter, isInitialized])

  const handleCategoryChange = (category: string | null) => {
    const baseParams: SearchParams = {
      location: searchParams.get('location') || undefined,
      check_in: searchParams.get('check_in') || undefined,
      check_out: searchParams.get('check_out') || undefined,
      guests: searchParams.get('guests') ? parseInt(searchParams.get('guests')!) : undefined,
    }

    if (category) {
      const filterParams: FilterParams = {
        ...baseParams,
        categories: [category]
      }
      filter(filterParams)
    } else {
      // Remove undefined values
      const cleanParams = Object.fromEntries(
        Object.entries(baseParams).filter(([_, value]) => value !== undefined)
      )
      search(cleanParams)
    }
  }

  const handleSearchResults = (searchData: any) => {
    // This will be called when search is performed from the search section
    // The search hook will automatically update the results
  }

  return (
    <div className="min-h-screen bg-white">
      <SearchSection onSearchResults={handleSearchResults} />
      <CategoryFilters onCategoryChange={handleCategoryChange} />
      
      {/* Search Results Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {total > 0 ? `${total} properties found` : 'Search results'}
            </h1>
            {searchParams.get('location') && (
              <p className="text-gray-600 mt-1">
                in {searchParams.get('location')}
              </p>
            )}
          </div>
          
          {/* Search filters summary */}
          <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
            {searchParams.get('check_in') && searchParams.get('check_out') && (
              <span>
                {new Date(searchParams.get('check_in')!).toLocaleDateString()} - {' '}
                {new Date(searchParams.get('check_out')!).toLocaleDateString()}
              </span>
            )}
            {searchParams.get('guests') && (
              <span>{searchParams.get('guests')} guests</span>
            )}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Search Error
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Property Grid */}
      <EnhancedPropertyGrid
        properties={displayedProperties}
        loading={loading}
        hasMore={hasMore}
        canShowMore={canShowMore}
        onLoadMore={loadMore}
        onShowMore={showMore}
        onToggleFavorite={(propertyId) => {
          console.log('Toggle favorite for property:', propertyId)
          // TODO: Implement favorite toggle API call
        }}
      />
    </div>
  )
}