"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Search, MapPin, Clock, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { propertyApi } from "@/lib/api"
import { useDebounce } from "@/hooks/use-performance-optimization"

interface LocationSuggestionItem {
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

// Static destinations from backend listings
const STATIC_DESTINATIONS: { key: string; display_name: string }[] = [
  { key: "new_york", display_name: "New York City, USA" },
  { key: "london", display_name: "London, UK" },
  { key: "paris", display_name: "Paris, France" },
  { key: "rome", display_name: "Rome, Italy" },
  { key: "bangkok", display_name: "Bangkok, Thailand" },
  { key: "tokyo", display_name: "Tokyo, Japan" },
  { key: "sydney", display_name: "Sydney, Australia" },
  { key: "rio", display_name: "Rio de Janeiro, Brazil" },
  { key: "cape_town", display_name: "Cape Town, South Africa" },
  { key: "miami", display_name: "Miami, USA" },
  { key: "barcelona", display_name: "Barcelona, Spain" },
  { key: "bali", display_name: "Bali, Indonesia" },
  { key: "amsterdam", display_name: "Amsterdam, Netherlands" },
  { key: "berlin", display_name: "Berlin, Germany" },
  { key: "ho_chi_minh", display_name: "Ho Chi Minh City, Vietnam" },
  { key: "hanoi", display_name: "Hanoi, Vietnam" },
  { key: "da_nang", display_name: "Da Nang, Vietnam" },
  { key: "hoi_an", display_name: "Hoi An, Vietnam" },
  { key: "nha_trang", display_name: "Nha Trang, Vietnam" },
  { key: "ha_long", display_name: "Ha Long Bay, Vietnam" },
  { key: "hue", display_name: "Hue, Vietnam" },
  { key: "da_lat", display_name: "Da Lat, Vietnam" },
  { key: "dubai", display_name: "Dubai, UAE" },
  { key: "abu_dhabi", display_name: "Abu Dhabi, UAE" },
  { key: "sharjah", display_name: "Sharjah, UAE" },
  { key: "ajman", display_name: "Ajman, UAE" },
  { key: "fujairah", display_name: "Fujairah, UAE" },
  { key: "ras_al_khaimah", display_name: "Ras Al Khaimah, UAE" },
  { key: "umm_al_quwain", display_name: "Umm Al Quwain, UAE" },
  { key: "seoul", display_name: "Seoul, South Korea" },
  { key: "busan", display_name: "Busan, South Korea" },
  { key: "incheon", display_name: "Incheon, South Korea" },
]

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
  const [suggestions, setSuggestions] = useState<LocationSuggestionItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  
  const abortControllerRef = useRef<AbortController | null>(null)
  const debouncedSearchInput = useDebounce(searchInput, 250)

  // Precomputed static matches for quick filtering
  const staticMatches = useMemo(() => {
    const q = debouncedSearchInput.trim().toLowerCase()
    if (!q) return [] as LocationSuggestionItem[]
    return STATIC_DESTINATIONS.filter(d => d.display_name.toLowerCase().includes(q)).map((d, i) => ({
      id: `static-${d.key}-${i}`,
      name: d.display_name.split(',')[0],
      type: 'city',
      full_name: d.display_name,
    }))
  }, [debouncedSearchInput])

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

  // Fetch location suggestions (API)
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
      const res = await propertyApi.getLocationSuggestions(query, 10)
      const mapped: LocationSuggestionItem[] = (res.suggestions ?? []).map(s => ({
        id: String((s as any).id ?? (s as any).full_name),
        name: (s as any).name ?? (s as any).city ?? (s as any).full_name,
        type: ((s as any).type ?? 'city') as LocationSuggestionItem['type'],
        full_name: (s as any).full_name ?? (s as any).display_name,
        coordinates: (s as any).coordinates,
        property_count: (s as any).property_count,
        popularity_score: (s as any).popularity_score,
      }))
      setSuggestions(mapped)
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
    if (debouncedSearchInput.trim().length < 2) {
      setSuggestions([])
      return
    }
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
    <div className="absolute left-1/2 -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-3xl shadow-2xl z-50 p-6 w-[min(90vw,56rem)]">
      <div className="space-y-6">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search destinations"
            className="pl-10 h-12 border-gray-200 rounded-full"
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
          <div className="flex items-center justify-center py-8">
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

        {/* Static Matches */}
        {!loading && staticMatches.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Matching destinations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {staticMatches.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleLocationSelect(m.full_name)}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <div className="text-lg">{getLocationIcon(m.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{m.name}</div>
                    <div className="text-sm text-gray-500 truncate">{m.full_name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Suggestions (API) */}
        {!loading && searchInput && suggestions.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Suggestions</h3>
            <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
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

        {/* Popular Destinations Grid */}
        {!searchInput && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Popular destinations</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {STATIC_DESTINATIONS.slice(0, 9).map((d) => (
                <Button
                  key={d.key}
                  variant="outline"
                  size="sm"
                  onClick={() => handleLocationSelect(d.display_name)}
                  className={`rounded-xl border-gray-300 hover:border-gray-900 justify-start`}
                >
                  <span className="truncate">{d.display_name}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}