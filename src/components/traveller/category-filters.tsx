"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { propertyApi } from "@/lib/api"
import { getCategoryIconByCode, getCategoryLabelByCode, useTranslatedCategoryLabel } from "./category-icons"

interface CategoryItem {
  name: string
  display_name: string
}

interface CategoryFiltersProps {
  onCategoryChange: (categories: string[]) => void
  selectedCategories?: string[]
}

export function CategoryFilters({ onCategoryChange, selectedCategories: propSelectedCategories }: CategoryFiltersProps) {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(propSelectedCategories || [])
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const getTranslatedCategoryLabel = useTranslatedCategoryLabel()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await propertyApi.getCategories()
        const normalized: CategoryItem[] = Array.isArray(data)
          ? (typeof (data as any[])[0] === 'string'
              ? (data as string[]).map(code => ({ name: code, display_name: getTranslatedCategoryLabel(code) }))
              : (data as any[]).map((c: any) => ({ name: c.name, display_name: c.display_name ?? getTranslatedCategoryLabel(c.name) }))
            )
          : []
        setCategories(normalized)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Sync selected categories with URL params or prop
  useEffect(() => {
    const fromUrlPrimary = searchParams.getAll('categories')
    const fromUrlLegacy = searchParams.getAll('category')
    const fromUrl = fromUrlPrimary.length > 0 ? fromUrlPrimary : fromUrlLegacy
    const initial = propSelectedCategories && propSelectedCategories.length > 0 ? propSelectedCategories : fromUrl
    if (initial && initial.join('|') !== selectedCategories.join('|')) {
      setSelectedCategories(initial)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, propSelectedCategories])

  const toggleCategory = (categoryName: string) => {
    const isSelected = selectedCategories.includes(categoryName)
    const updated = isSelected
      ? selectedCategories.filter(c => c !== categoryName)
      : [...selectedCategories, categoryName]

    setSelectedCategories(updated)
    onCategoryChange(updated)

    if (pathname === '/search') {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('categories')
      params.delete('category')
      updated.forEach(c => params.append('categories', c))
      router.push(`/search?${params.toString()}`)
    }
  }

  const isSelected = (name: string) => selectedCategories.includes(name)

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
          const IconComp = getCategoryIconByCode(category.name)
          const displayName = category.display_name || getTranslatedCategoryLabel(category.name)
          const selected = isSelected(category.name)

          return (
            <button
              key={category.name}
              onClick={() => toggleCategory(category.name)}
              className={`flex flex-col items-center space-y-2 min-w-[80px] group ${
                selected ? "opacity-100" : "opacity-70 hover:opacity-100"
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center bg-gray-100 group-hover:bg-gray-200 transition-colors ${
                  selected ? "border-2 border-black" : "border border-gray-200"
                }`}
              >
                {IconComp ? (
                  <IconComp className="h-6 w-6 text-gray-700" />
                ) : (
                  <span className="text-2xl">{getCategoryEmoji(category.name)}</span>
                )}
              </div>
              <span
                className={`text-sm ${
                  selected ? "font-medium" : "text-gray-600"
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
