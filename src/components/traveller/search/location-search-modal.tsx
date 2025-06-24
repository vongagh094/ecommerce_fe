"use client"

import { useState } from "react"
import { Search, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface LocationSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (location: string) => void
  selectedLocation: string
}

const popularRegions = ["Anywhere", "Dalat", "Hanoi", "Ho Chi Minh City", "Nha Trang", "Danang"]

const searchSuggestions = [
  { name: "Bordeaux, France", type: "City" },
  { name: "Bordeaux Getaway", type: "Property" },
  { name: "Bordeaux Wine Region", type: "Region" },
  { name: "Vietnam", type: "Country" },
  { name: "Maldives", type: "Country" },
  { name: "Thailand", type: "Country" },
]

export function LocationSearchModal({ isOpen, onClose, onSelect, selectedLocation }: LocationSearchModalProps) {
  const [searchInput, setSearchInput] = useState("")
  const [filteredSuggestions, setFilteredSuggestions] = useState(searchSuggestions)

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (value.trim()) {
      const filtered = searchSuggestions.filter((suggestion) =>
        suggestion.name.toLowerCase().includes(value.toLowerCase()),
      )
      setFilteredSuggestions(filtered)
    } else {
      setFilteredSuggestions(searchSuggestions)
    }
  }

  const handleLocationSelect = (location: string) => {
    onSelect(location)
    onClose()
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
        </div>

        {/* Search by Region */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Search by region</h3>
          <div className="flex flex-wrap gap-2">
            {popularRegions.map((region) => (
              <Button
                key={region}
                variant="outline"
                size="sm"
                onClick={() => handleLocationSelect(region)}
                className={`rounded-full border-gray-300 hover:border-gray-900 ${
                  selectedLocation === region ? "bg-gray-900 text-white" : ""
                }`}
              >
                {region}
              </Button>
            ))}
          </div>
        </div>

        {/* Search Suggestions */}
        {searchInput && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Suggestions</h3>
            <div className="space-y-2">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleLocationSelect(suggestion.name)}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">{suggestion.name}</div>
                    <div className="text-sm text-gray-500">{suggestion.type}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
