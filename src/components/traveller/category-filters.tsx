"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { propertyApi } from "@/lib/api"
import { Category } from "@/types"
import { getCategoryIconByCode, getCategoryLabelByCode } from "./category-icons"

interface CategoryFiltersProps {
  onCategoryChange: (category: string | null) => void
  selectedCategory?: string | null
}

export function CategoryFilters({ onCategoryChange, selectedCategory: propSelectedCategory }: CategoryFiltersProps) {
  const [categories, setCategories] = useState<string []>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await propertyApi.getCategories()
        setCategories(data)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Sync selected category with URL params or prop
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    const initialCategory = propSelectedCategory || categoryFromUrl
    
    if (initialCategory && initialCategory !== selectedCategory) {
      setSelectedCategory(initialCategory)
    }
  }, [searchParams, propSelectedCategory, selectedCategory])

  const handleCategoryClick = (categoryName: string) => {
    const newCategory = selectedCategory === categoryName ? null : categoryName
    setSelectedCategory(newCategory)
    onCategoryChange(newCategory)
    
    // Update URL if we're on the search page
    if (pathname === '/search') {
      const params = new URLSearchParams(searchParams.toString())
      
      if (newCategory) {
        params.set('category', newCategory)
      } else {
        params.delete('category')
      }
      
      router.push(`/search?${params.toString()}`)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-2 min-w-[80px]">
              <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-gray-200">
      <div className="flex space-x-8 overflow-x-auto pb-4">
        {categories.map((category) => {
          const IconComp = getCategoryIconByCode(category)
          const displayName = getCategoryLabelByCode(category)

          return (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`flex flex-col items-center space-y-2 min-w-[80px] group ${
                selectedCategory === category
                  ? "opacity-100"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center bg-gray-100 group-hover:bg-gray-200 transition-colors ${
                  selectedCategory === category
                    ? "border-2 border-black"
                    : "border border-gray-200"
                }`}
              >
                {IconComp ? (
                  <IconComp className="h-6 w-6 text-gray-700" />
                ) : (
                  <span className="text-2xl">{getCategoryEmoji(category)}</span>
                )}
              </div>
              <span
                className={`text-sm ${
                  selectedCategory === category
                    ? "font-medium"
                    : "text-gray-600"
                }`}
              >
                {displayName}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Helper function to get emoji for category (fallback)
function getCategoryEmoji(categoryName: string): string {
  const emojiMap: Record<string, string> = {
    beach: "🏖️",
    mountain: "⛰️",
    city: "🏙️",
    countryside: "🏞️",
    lake: "🌊",
    ski: "⛷️",
    tropical: "🌴",
    desert: "🏜️",
    cabin: "🏡",
    castle: "🏰",
    amazing_views: "🌄",
    design: "🎨",
    camping: "⛺",
    historic: "🏛️",
    default: "🏠",
  }

  return emojiMap[categoryName] || emojiMap.default
}
