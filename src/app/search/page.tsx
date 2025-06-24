"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { SearchResultsHeader } from "@/components/traveller/search/search-results-header"
import { SearchFilters } from "@/components/traveller/search/search-filters"
import { SearchResultsList } from "@/components/traveller/search/search-results-list"
import { SearchResultsMap } from "@/components/traveller/search/search-results-map"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [showMap, setShowMap] = useState(false)
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    propertyType: "any",
    amenities: [] as string[],
  })

  const searchData = {
    location: searchParams.get("location") || "",
    checkIn: searchParams.get("checkIn") ? new Date(searchParams.get("checkIn")!) : null,
    checkOut: searchParams.get("checkOut") ? new Date(searchParams.get("checkOut")!) : null,
    guests: Number.parseInt(searchParams.get("guests") || "1"),
  }

  return (
    <div className="min-h-screen bg-white">
      <SearchResultsHeader searchData={searchData} showMap={showMap} onToggleMap={() => setShowMap(!showMap)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SearchFilters filters={filters} onFiltersChange={setFilters} />

        <div className="flex">
          <div className={`${showMap ? "w-1/2" : "w-full"} transition-all duration-300`}>
            <SearchResultsList filters={filters} />
          </div>

          {showMap && (
            <div className="w-1/2 sticky top-0 h-screen">
              <SearchResultsMap />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
