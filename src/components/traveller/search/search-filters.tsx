"use client"

import { useState } from "react"
import { ChevronDown, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SearchFiltersProps {
  filters: {
    priceRange: number[]
    propertyType: string
    amenities: string[]
  }
  onFiltersChange: (filters: any) => void
}

const filterOptions = [
  { id: "price", label: "Price", hasDropdown: true },
  { id: "type", label: "Type of place", hasDropdown: true },
  { id: "cancellation", label: "Free cancellation", hasDropdown: false },
  { id: "wifi", label: "Wifi", hasDropdown: false },
  { id: "kitchen", label: "Kitchen", hasDropdown: false },
  { id: "ac", label: "Air conditioning", hasDropdown: false },
  { id: "washer", label: "Washer", hasDropdown: false },
  { id: "iron", label: "Iron", hasDropdown: false },
  { id: "workspace", label: "Dedicated workspace", hasDropdown: false },
  { id: "parking", label: "Free parking", hasDropdown: false },
]

export function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  return (
    <div className="border-b bg-white py-4">
      <div className="flex items-center space-x-4 overflow-x-auto scrollbar-hide">
        {filterOptions.map((filter) => (
          <Button
            key={filter.id}
            variant="outline"
            size="sm"
            onClick={() => setActiveFilter(activeFilter === filter.id ? null : filter.id)}
            className="flex items-center space-x-2 whitespace-nowrap border-gray-300 hover:border-gray-900"
          >
            <span>{filter.label}</span>
            {filter.hasDropdown && <ChevronDown className="h-3 w-3" />}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2 border-gray-300 hover:border-gray-900"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
        </Button>
      </div>
    </div>
  )
}
