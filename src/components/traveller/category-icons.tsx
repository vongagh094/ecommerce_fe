"use client"

import React from "react"
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
  CheckCircle,
  Utensils,
  Bath,
  Sparkles,
} from "lucide-react"
import { usePropertyTranslations } from "@/hooks/use-translations"

export const CATEGORY_ICON_MAP: Record<string, React.ComponentType<any>> = {
  CHECK_IN: CheckCircle,
  TROPHY: Trophy,
  DRAFTING_TOOLS: Building2,
  TOILET_UPRIGHT: Bath,
  POOL: Waves,
  HAND_WAVE: Star,
  LAKE: Waves,
  GOLDEN_TROPHY: Award,
  BOOK: BookOpen,
  JACUZZI: Bath,
  WI_FI: Wifi,
  PARKING: Car,
  MAPS_PARK: Trees,
  VIEW_CITY: Building2,
  BREAKFAST: Utensils,
  VIEW_OCEAN: Waves,
  SHARED_HOME: Users,
  EARTH_HOUSE: Leaf,
  MESSAGE_READ: MessageCircle,
  WORKSPACE: Globe,
  PETS: Users,
  GYM: Dumbbell,
  WHY_HOST: Star,
  SUPERHOST: Sparkles,
  BED_KING: Bed,
  SHOWER: ShowerHead,
  GLOBE_STAND: Globe,
  VIEW_MOUNTAIN: Mountain,
  PRIVATE_BEDROOM: Home,
  NATURE_PARK: Trees,
  HOST_LISTING_RESIDENTIAL: Home,
  KEY: Key,
  PALM_TREE: Palmtree,
  LOCATION: MapPin,
  COFFEE_MAKER: Coffee,
}

const CATEGORY_LABEL_MAP: Record<string, string> = {
  CHECK_IN: "Easy Check-in",
  TROPHY: "Award Winner",
  DRAFTING_TOOLS: "Architect Designed",
  TOILET_UPRIGHT: "Private Bathroom",
  POOL: "Swimming Pool",
  HAND_WAVE: "Warm Welcome",
  LAKE: "Lakefront",
  GOLDEN_TROPHY: "Premium Property",
  BOOK: "Guidebook",
  JACUZZI: "Hot Tub",
  WI_FI: "High-Speed WiFi",
  PARKING: "Free Parking",
  MAPS_PARK: "Near Park",
  VIEW_CITY: "City View",
  BREAKFAST: "Breakfast",
  VIEW_OCEAN: "Ocean View",
  SHARED_HOME: "Shared Home",
  EARTH_HOUSE: "Eco Stay",
  MESSAGE_READ: "Responsive Host",
  WORKSPACE: "Workspace",
  PETS: "Pet Friendly",
  GYM: "Gym",
  WHY_HOST: "Top Host",
  SUPERHOST: "Superhost",
  BED_KING: "King Bed",
  SHOWER: "Shower",
  GLOBE_STAND: "Global",
  VIEW_MOUNTAIN: "Mountain View",
  PRIVATE_BEDROOM: "Private Room",
  NATURE_PARK: "Nature Park",
  HOST_LISTING_RESIDENTIAL: "Residential",
  KEY: "Keyless Entry",
  PALM_TREE: "Tropical",
  LOCATION: "Great Location",
  COFFEE_MAKER: "Coffee Maker",
}

export function getCategoryIconByCode(code?: string): React.ComponentType<any> | null {
  if (!code) return null
  return CATEGORY_ICON_MAP[code] || null
}

export function getCategoryLabelByCode(code?: string): string {
  const key = typeof code === 'string' ? code : ''
  if (CATEGORY_LABEL_MAP[key]) return CATEGORY_LABEL_MAP[key]
  return key ? key.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : 'Category'
}

// Hook-based function for translated category labels
export function useTranslatedCategoryLabel() {
  const t = usePropertyTranslations()
  
  return (code?: string): string => {
    if (!code) return 'Category'
    
    // Try to get translation first
    const translatedLabel = t(`categories.${code}`)
    if (translatedLabel && translatedLabel !== `categories.${code}`) {
      return translatedLabel
    }
    
    // Fallback to original English labels
    if (CATEGORY_LABEL_MAP[code]) {
      return CATEGORY_LABEL_MAP[code]
    }
    
    // Final fallback to formatted code
    return code.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
  }
} 