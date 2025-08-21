"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { SearchSection } from "@/components/traveller/search-section"
import { CategoryFilters } from "@/components/traveller/category-filters"
import { PropertyGrid } from "@/components/traveller/property-grid"
import { Pagination } from "@/components/shared/pagination"
import { usePaginatedPropertySearch } from "@/hooks/use-property-search"
import { SearchParams, FilterParams } from "@/types"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const {
    properties,
    loading,
    error,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    search,
    filter,
    goToPage
  } = usePaginatedPropertySearch(40) // 40 items per page
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

      // Check if we have category filters (multi)
      const categoriesFromUrl = searchParams.getAll('categories')
      if (categoriesFromUrl.length > 0) {
        const filterParams: FilterParams = {
          ...params,
          categories: categoriesFromUrl,
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
        // Don't do default search - let users search manually
      }

      setIsInitialized(true)
    }
  }, [searchParams, search, filter, isInitialized])

  const handleCategoryChange = (categories: string[]) => {
    const baseParams: SearchParams = {
      location: searchParams.get('location') || undefined,
      check_in: searchParams.get('check_in') || undefined,
      check_out: searchParams.get('check_out') || undefined,
      guests: searchParams.get('guests') ? parseInt(searchParams.get('guests')!) : undefined,
    }

    if (categories && categories.length > 0) {
      const filterParams: FilterParams = {
        ...baseParams,
        categories,
      }
      filter(filterParams)
    } else {
      const cleanParams = Object.fromEntries(
        Object.entries(baseParams).filter(([_, value]) => value !== undefined)
      )
      search(cleanParams)
    }
  }

  const handleSearchResults = (_searchData: any) => {
    // This will be called when search is performed from the search section
    // The search hook will automatically update the results
  }

  const handlePageChange = (page: number) => {
    console.log(`Search page: Changing to page ${page}`)
    goToPage(page)

    // Scroll to top when changing pages
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
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
              {totalItems > 0 ? `${totalItems} properties found` : 'Search results'}
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
      {!!error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Search Error
            </h3>
            <p className="text-red-600 mb-4">
              {error instanceof Error ? error.message : 'Something went wrong'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Property Grid with Pagination */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Summary */}
        {!loading && properties.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} properties
            </p>
          </div>
        )}

        {/* Error State */}
        {!!error && (
          <div className="py-16 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Failed to load properties
              </h3>
              <p className="text-gray-600 mb-4">
                {error instanceof Error ? error.message : 'Something went wrong'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors"
              >
                Reload
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && properties.length === 0 && (
          <div className="py-16 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No properties found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or browse different categories.
              </p>
            </div>
          </div>
        )}

        {/* Properties Grid */}
        {!error && (
          <PropertyGrid
            properties={properties}
            loading={loading}
            onToggleFavorite={(propertyId) => {
              console.log('Toggle favorite for property:', propertyId)
              // TODO: Implement favorite toggle API call
            }}
          />
        )}

        {/* Pagination */}
        {!loading && !error && properties.length > 0 && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNext={currentPage < totalPages}
            hasPrev={currentPage > 1}
            loading={loading}
            onPageChange={handlePageChange}
            onNext={() => handlePageChange(currentPage + 1)}
            onPrev={() => handlePageChange(currentPage - 1)}
          />
        )}
      </div>
    </div>
  )
}