import { SearchSection } from "@/components/traveller/search-section"
import { CategoryFilters } from "@/components/traveller/category-filters"
import { HeroSection } from "@/components/traveller/hero-section"
import { PropertyGrid } from "@/components/traveller/property-grid"
import { InspirationSection } from "@/components/traveller/inspiration-section"
import { Footer } from "@/components/shared/footer"
import { AiChatBubble } from "@/components/shared/ai-chat-bubble"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <SearchSection />
      <CategoryFilters />
      <HeroSection />
      {/* <PropertyGrid /> */}
      <InspirationSection />
      <Footer />
      <AiChatBubble />
    </main>
  )
}
