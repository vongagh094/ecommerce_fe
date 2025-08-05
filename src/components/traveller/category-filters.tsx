"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { useCategories } from "@/hooks/use-categories"
import { useRouter, useSearchParams } from "next/navigation"

// Fallback categories with icons
const fallbackCategories = [
  { name: "amazing_views", display_name: "Amazing views", icon: "🏔️", property_count: 0 },
  { name: "farms", display_name: "Farms", icon: "🚜", property_count: 0 },
  { name: "design", display_name: "Design", icon: "🎨", property_count: 0 },
  { name: "bed_breakfast", display_name: "Bed & breakfasts", icon: "🛏️", property_count: 0 },
  { name: "iconic_cities", display_name: "Iconic cities", icon: "🏙️", property_count: 0 },
  { name: "treehouses", display_name: "Treehouses", icon: "🌳", property_count: 0 },
  { name: "countryside", display_name: "Countryside", icon: "🌾", property_count: 0 },
  { name: "amazing_pool", display_name: "Amazing pool", icon: "🏊", property_count: 0 },
  { name: "beach", display_name: "Beach", icon: "🏖️", property_count: 0 },
  { name: "camper_vans", display_name: "Camper vans", icon: "🚐", property_count: 0 },
  { name: "islands", display_name: "Islands", icon: "🏝️", property_count: 0 },
  { name: "national_parks", display_name: "National parks", icon: "🏞️", property_count: 0 },
  { name: "omg", display_name: "OMG!", icon: "😱", property_count: 0 },
  { name: "camping", display_name: "Camping", icon: "⛺", property_count: 0 },
  { name: "arctic", display_name: "Arctic", icon: "🧊", property_count: 0 },
  { name: "cabin", display_name: "Cabin", icon: "🏘️", property_count: 0 },
]

interface CategoryFiltersProps {
  onCategoryChange?: (category: string | null) => void
  onFiltersClick?: () => void
}

export function CategoryFilters({ onCategoryChange, onFiltersClick }: CategoryFiltersProps) {
  const { categories, loading, error } = useCategories()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Use API categories if available, otherwise fallback
  const displayCategories = categories.length > 0 ? categories : fallbackCategories

  // Initialize selected category from URL
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
    }
  }, [searchParams])

  const handleCategoryClick = (categoryName: string) => {
    const newCategory = selectedCategory === categoryName ? null : categoryName
    setSelectedCategory(newCategory)
    
    // Update URL with category filter
    const params = new URLSearchParams(searchParams.toString())
    if (newCategory) {
      params.set('category', newCategory)
    } else {
      params.delete('category')
    }
    
    // Navigate to search page with category filter
    router.push(`/search?${params.toString()}`)
    
    // Notify parent component
    if (onCategoryChange) {
      onCategoryChange(newCategory)
    }
  }

  const handleFiltersClick = () => {
    if (onFiltersClick) {
      onFiltersClick()
    }
  }

  if (error) {
    console.error('Failed to load categories:', error)
  }

  return (
    <div className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-8 overflow-x-auto scrollbar-hide">
            {displayCategories.map((category) => (
              <button
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
                className={`flex flex-col items-center space-y-2 min-w-0 flex-shrink-0 pb-2 border-b-2 transition-colors ${
                  selectedCategory === category.name
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                disabled={loading}
              >
                {/* <span className="text-2xl">{category.icon}</span> */}
                <span className="text-xs font-medium whitespace-nowrap">
                  {category.display_name}
                  {category.property_count > 0 && (
                    <span className="ml-1 text-gray-400">({category.property_count})</span>
                  )}
                </span>
              </button>
            ))}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-4 flex-shrink-0"
            onClick={handleFiltersClick}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>
    </div>
  )
}
