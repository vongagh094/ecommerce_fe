"use client"

import { useEffect, useState } from "react"
import { SearchSection } from "@/components/traveller/search-section"
import { CategoryFilters } from "@/components/traveller/category-filters"
import { HeroSection } from "@/components/traveller/hero-section"
import { PaginatedPropertyGrid } from "@/components/traveller/paginated-property-grid"
import { InspirationSection } from "@/components/traveller/inspiration-section"
import { Footer } from "@/components/shared/footer"
import { AiChatBubble } from "@/components/shared/ai-chat-bubble"
import { usePagination } from "@/hooks/use-pagination"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const { 
    properties, 
    loading, 
    error,
    currentPage,
    totalPages,
    total,
    hasNext,
    hasPrev,
    search,
    goToPage,
    nextPage,
    prevPage
  } = usePagination()
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isInitialized) {
      search({})
      setIsInitialized(true)
    }
  }, [search, isInitialized])

  const handleSearchResults = (searchData: any) => {
    const params = new URLSearchParams()
    Object.entries(searchData || {}).forEach(([key, value]) => {
      if (key === 'categories' && Array.isArray(value)) {
        value.forEach(v => params.append('categories', String(v)))
      } else if (Array.isArray(value)) {
        value.forEach(v => params.append(key, String(v)))
      } else if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value))
      }
    })
    router.push(`/search?${params.toString()}`)
  }

  const handleCategoryChange = (categories: string[]) => {
    const params = new URLSearchParams()
    categories.forEach(c => params.append('categories', c))
    router.push(`/search?${params.toString()}`)
  }

  return (
    <main className="min-h-screen bg-white">
      <SearchSection onSearchResults={handleSearchResults} />
      <CategoryFilters onCategoryChange={handleCategoryChange} />
      <HeroSection />
      
      {/* Featured Properties Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-2">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Featured Properties
          </h2>
          <p className="text-gray-600">
            Discover unique places to stay around the world
          </p>
        </div>
      </div>

      <PaginatedPropertyGrid
        properties={properties}
        loading={loading}
        error={error}
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        hasNext={hasNext}
        hasPrev={hasPrev}
        onPageChange={goToPage}
        onNext={nextPage}
        onPrev={prevPage}
        onToggleFavorite={(propertyId) => {
          console.log('Toggle favorite for property:', propertyId)
        }}
      />

      <InspirationSection />
      <Footer />
      <AiChatBubble />
    </main>
  )
}