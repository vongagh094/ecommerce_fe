"use client"

import { PropertyHighlight } from "@/types"
import { 
  Trophy, 
  Wifi, 
  Car, 
  Coffee, 
  Waves, 
  Mountain, 
  Building2, 
  Trees, 
  Key, 
  MessageCircle, 
  Dumbbell, 
  Bed, 
  ShowerHead, 
  Palmtree, 
  MapPin, 
  Globe, 
  Home, 
  Leaf, 
  Users, 
  BookOpen, 
  Award, 
  Star, 
  Heart, 
  CheckCircle,
  Utensils,
  Bath,
  Briefcase,
  PawPrint,
  Sparkles
} from "lucide-react"

// Icon mapping for property highlights
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  SYSTEM_CHECK_IN: CheckCircle,
  SYSTEM_TROPHY: Trophy,
  SYSTEM_DRAFTING_TOOLS: Building2,
  SYSTEM_TOILET_UPRIGHT: Bath,
  SYSTEM_POOL: Waves,
  SYSTEM_HAND_WAVE: Heart,
  SYSTEM_LAKE: Waves,
  SYSTEM_GOLDEN_TROPHY: Award,
  SYSTEM_BOOK: BookOpen,
  SYSTEM_JACUZZI: Bath,
  SYSTEM_WI_FI: Wifi,
  SYSTEM_PARKING: Car,
  SYSTEM_MAPS_PARK: Trees,
  SYSTEM_VIEW_CITY: Building2,
  SYSTEM_BREAKFAST: Utensils,
  SYSTEM_VIEW_OCEAN: Waves,
  SYSTEM_SHARED_HOME: Users,
  SYSTEM_EARTH_HOUSE: Leaf,
  SYSTEM_MESSAGE_READ: MessageCircle,
  SYSTEM_WORKSPACE: Briefcase,
  SYSTEM_PETS: PawPrint,
  SYSTEM_GYM: Dumbbell,
  SYSTEM_WHY_HOST: Star,
  SYSTEM_SUPERHOST: Sparkles,
  SYSTEM_BED_KING: Bed,
  SYSTEM_SHOWER: ShowerHead,
  SYSTEM_GLOBE_STAND: Globe,
  SYSTEM_VIEW_MOUNTAIN: Mountain,
  SYSTEM_PRIVATE_BEDROOM: Home,
  SYSTEM_NATURE_PARK: Trees,
  SYSTEM_HOST_LISTING_RESIDENTIAL: Home,
  SYSTEM_KEY: Key,
  SYSTEM_PALM_TREE: Palmtree,
  SYSTEM_LOCATION: MapPin,
  SYSTEM_COFFEE_MAKER: Coffee,
}

interface PropertyHighlightsProps {
  highlights: PropertyHighlight[]
  maxDisplay?: number
  showAll?: boolean
}

export function PropertyHighlights({ 
  highlights, 
  maxDisplay = 6, 
  showAll = false 
}: PropertyHighlightsProps) {
  const displayHighlights = showAll ? highlights : highlights.slice(0, maxDisplay)
  const hasMore = highlights.length > maxDisplay && !showAll

  if (!highlights || highlights.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        What this place offers
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayHighlights.map((highlight) => {
          const IconComponent = ICON_MAP[highlight.icon] || Star
          
          return (
            <div 
              key={highlight.id} 
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-shrink-0 mt-1">
                <IconComponent className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {highlight.title}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  {highlight.subtitle}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {hasMore && (
        <div className="pt-4 border-t border-gray-200">
          <button className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors">
            Show all {highlights.length} amenities
          </button>
        </div>
      )}
    </div>
  )
}

// Utility component for displaying highlights in a compact grid
export function CompactPropertyHighlights({ 
  highlights, 
  maxDisplay = 4 
}: PropertyHighlightsProps) {
  const displayHighlights = highlights.slice(0, maxDisplay)
  const hasMore = highlights.length > maxDisplay

  if (!highlights || highlights.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {displayHighlights.map((highlight) => {
          const IconComponent = ICON_MAP[highlight.icon] || Star
          
          return (
            <div 
              key={highlight.id}
              className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-full text-sm"
            >
              <IconComponent className="h-4 w-4 text-gray-600" />
              <span className="text-gray-700 font-medium">
                {highlight.title}
              </span>
            </div>
          )
        })}
        
        {hasMore && (
          <div className="inline-flex items-center px-3 py-2 text-sm text-gray-500">
            +{highlights.length - maxDisplay} more
          </div>
        )}
      </div>
    </div>
  )
}