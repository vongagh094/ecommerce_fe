"use client"

import { useEffect, useState } from "react"
import { SearchSection } from "@/components/traveller/search-section"
import { CategoryFilters } from "@/components/traveller/category-filters"
import { HeroSection } from "@/components/traveller/hero-section"
import { EnhancedPropertyGrid } from "@/components/traveller/enhanced-property-grid"
import { InspirationSection } from "@/components/traveller/inspiration-section"
import { Footer } from "@/components/shared/footer"
import { AiChatBubble } from "@/components/shared/ai-chat-bubble"
import { usePropertySearch } from "@/hooks/use-property-search"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const { 
    displayedProperties, 
    loading, 
    hasMore, 
    canShowMore, 
    search, 
    loadMore, 
    showMore 
  } = usePropertySearch()
  const [isInitialized, setIsInitialized] = useState(false)
  const router = useRouter()

  // Load initial properties on page load
  useEffect(() => {
    if (!isInitialized) {
      // Load some featured properties for the homepage
      search({ limit: 20 })
      setIsInitialized(true)
    }
  }, [search, isInitialized])

  const handleSearchResults = (searchData: any) => {
    // Redirect to search page with parameters
    const params = new URLSearchParams()
    Object.entries(searchData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString())
      }
    })
    router.push(`/search?${params.toString()}`)
  }

  const handleCategoryChange = (category: string | null) => {
    // Redirect to search page with category filter
    const params = new URLSearchParams()
    if (category) {
      params.append('category', category)
    }
    router.push(`/search?${params.toString()}`)
  }

  return (
    <main className="min-h-screen bg-white">
      <SearchSection onSearchResults={handleSearchResults} />
      <CategoryFilters onCategoryChange={handleCategoryChange} />
      <HeroSection />
      
      {/* Featured Properties Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Featured Properties
          </h2>
          <p className="text-gray-600">
            Discover unique places to stay around the world
          </p>
        </div>
      </div>

      <EnhancedPropertyGrid
        properties={displayedProperties}
        loading={loading}
        hasMore={hasMore}
        canShowMore={canShowMore}
        onLoadMore={loadMore}
        onShowMore={showMore}
        onToggleFavorite={(propertyId) => {
          console.log('Toggle favorite for property:', propertyId)
          // TODO: Implement favorite toggle API call
        }}
      />

      <InspirationSection />
      <Footer />
      <AiChatBubble />
    </main>
  )
}
