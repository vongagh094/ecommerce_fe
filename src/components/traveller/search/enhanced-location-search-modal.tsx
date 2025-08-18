"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Search, MapPin, Clock, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { propertyApi } from "@/lib/api"
import { useDebounce } from "@/hooks/use-performance-optimization"

interface LocationSuggestion {
  id: string
  name: string
  type: 'city' | 'region' | 'country' | 'property'
  full_name: string
  coordinates?: [number, number]
  property_count?: number
  popularity_score?: number
}

interface EnhancedLocationSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (location: string) => void
  selectedLocation: string
}

const popularRegions = [
  { name: "Anywhere", type: "global" as const },
  { name: "Dalat", type: "city" as const },
  { name: "Hanoi", type: "city" as const },
  { name: "Ho Chi Minh City", type: "city" as const },
  { name: "Nha Trang", type: "city" as const },
  { name: "Danang", type: "city" as const }
]

export function EnhancedLocationSearchModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  selectedLocation 
}: EnhancedLocationSearchModalProps) {
  const [searchInput, setSearchInput] = useState("")
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  
  const abortControllerRef = useRef<AbortController | null>(null)
  const debouncedSearchInput = useDebounce(searchInput, 300)

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recent_location_searches')
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved).slice(0, 5))
        } catch (e) {
          console.warn('Failed to parse recent searches:', e)
        }
      }
    }
  }, [])

  // Save recent search
  const saveRecentSearch = useCallback((location: string) => {
    if (typeof window === 'undefined' || !location.trim()) return
    
    const updated = [location, ...recentSearches.filter(s => s !== location)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recent_location_searches', JSON.stringify(updated))
  }, [recentSearches])

  // Fetch location suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    setLoading(true)
    setError(null)

    try {
      const response = await propertyApi.getLocationSuggestions(query, 8)
      
      if (!abortController.signal.aborted) {
        setSuggestions(response.suggestions || [])
      }
    } catch (err) {
      if (!abortController.signal.aborted) {
        setError(err instanceof Error ? err.message : 'Failed to fetch suggestions')
        setSuggestions([])
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false)
      }
    }
  }, [])

  // Debounced search effect
  useEffect(() => {
    fetchSuggestions(debouncedSearchInput)
  }, [debouncedSearchInput, fetchSuggestions])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
  }

  const handleLocationSelect = (location: string) => {
    saveRecentSearch(location)
    onSelect(location)
    onClose()
  }

  const clearSearch = () => {
    setSearchInput("")
    setSuggestions([])
    setError(null)
  }

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'city':
        return '🏙️'
      case 'region':
        return '🗺️'
      case 'country':
        return '🌍'
      case 'property':
        return '🏠'
      default:
        return '📍'
    }
  }

  if (!isOpen) return null

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 p-6 max-w-md">
      <div className="space-y-6">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search destinations"
            className="pl-10 h-12 border-gray-200 rounded-lg"
            autoFocus
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm text-gray-600">Searching...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-4">
            <p className="text-sm text-red-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchSuggestions(searchInput)}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Search Suggestions */}
        {!loading && searchInput && suggestions.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Suggestions</h3>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleLocationSelect(suggestion.full_name)}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <div className="text-lg">
                    {getLocationIcon(suggestion.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {suggestion.name}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {suggestion.full_name}
                      {suggestion.property_count && (
                        <span className="ml-2">
                          • {suggestion.property_count} properties
                        </span>
                      )}
                    </div>
                  </div>
                  {suggestion.popularity_score && suggestion.popularity_score > 0.8 && (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && searchInput && suggestions.length === 0 && !error && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600">No destinations found</p>
            <p className="text-xs text-gray-500 mt-1">
              Try searching for a city, region, or country
            </p>
          </div>
        )}

        {/* Recent Searches */}
        {!searchInput && recentSearches.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Recent searches
            </h3>
            <div className="space-y-1">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleLocationSelect(search)}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{search}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Popular Regions */}
        {!searchInput && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Search by region</h3>
            <div className="flex flex-wrap gap-2">
              {popularRegions.map((region) => (
                <Button
                  key={region.name}
                  variant="outline"
                  size="sm"
                  onClick={() => handleLocationSelect(region.name)}
                  className={`rounded-full border-gray-300 hover:border-gray-900 ${
                    selectedLocation === region.name ? "bg-gray-900 text-white" : ""
                  }`}
                >
                  {region.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}