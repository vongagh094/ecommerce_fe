// Property Highlights Icon Mapping
// Maps database icon names to user-friendly titles and descriptions

export interface PropertyHighlightMapping {
  icon: string;
  title: string;
  subtitle: string;
  category: 'amenity' | 'view' | 'accommodation' | 'location' | 'host' | 'policy';
}

export const PROPERTY_HIGHLIGHTS_MAP: Record<string, PropertyHighlightMapping> = {
  // Accommodation Features
  SYSTEM_CHECK_IN: {
    icon: 'SYSTEM_CHECK_IN',
    title: 'Easy Check-in',
    subtitle: 'Smooth arrival process',
    category: 'policy'
  },
  
  SYSTEM_TROPHY: {
    icon: 'SYSTEM_TROPHY',
    title: 'Award Winner',
    subtitle: 'Recognized excellence',
    category: 'host'
  },
  
  SYSTEM_DRAFTING_TOOLS: {
    icon: 'SYSTEM_DRAFTING_TOOLS',
    title: 'Architect Designed',
    subtitle: 'Professionally designed space',
    category: 'accommodation'
  },
  
  SYSTEM_TOILET_UPRIGHT: {
    icon: 'SYSTEM_TOILET_UPRIGHT',
    title: 'Private Bathroom',
    subtitle: 'Dedicated bathroom facilities',
    category: 'amenity'
  },
  
  SYSTEM_POOL: {
    icon: 'SYSTEM_POOL',
    title: 'Swimming Pool',
    subtitle: 'Private or shared pool access',
    category: 'amenity'
  },
  
  SYSTEM_HAND_WAVE: {
    icon: 'SYSTEM_HAND_WAVE',
    title: 'Warm Welcome',
    subtitle: 'Friendly host greeting',
    category: 'host'
  },
  
  SYSTEM_LAKE: {
    icon: 'SYSTEM_LAKE',
    title: 'Lakefront',
    subtitle: 'Direct lake access',
    category: 'location'
  },
  
  SYSTEM_GOLDEN_TROPHY: {
    icon: 'SYSTEM_GOLDEN_TROPHY',
    title: 'Premium Property',
    subtitle: 'Top-rated accommodation',
    category: 'host'
  },
  
  SYSTEM_BOOK: {
    icon: 'SYSTEM_BOOK',
    title: 'Local Guidebook',
    subtitle: 'Curated recommendations included',
    category: 'host'
  },
  
  SYSTEM_JACUZZI: {
    icon: 'SYSTEM_JACUZZI',
    title: 'Hot Tub',
    subtitle: 'Private jacuzzi or hot tub',
    category: 'amenity'
  },
  
  SYSTEM_WI_FI: {
    icon: 'SYSTEM_WI_FI',
    title: 'High-Speed WiFi',
    subtitle: 'Fast internet connection',
    category: 'amenity'
  },
  
  SYSTEM_PARKING: {
    icon: 'SYSTEM_PARKING',
    title: 'Free Parking',
    subtitle: 'Dedicated parking space',
    category: 'amenity'
  },
  
  SYSTEM_MAPS_PARK: {
    icon: 'SYSTEM_MAPS_PARK',
    title: 'Near Park',
    subtitle: 'Close to recreational areas',
    category: 'location'
  },
  
  SYSTEM_VIEW_CITY: {
    icon: 'SYSTEM_VIEW_CITY',
    title: 'City View',
    subtitle: 'Stunning urban skyline',
    category: 'view'
  },
  
  SYSTEM_BREAKFAST: {
    icon: 'SYSTEM_BREAKFAST',
    title: 'Breakfast Included',
    subtitle: 'Complimentary morning meal',
    category: 'amenity'
  },
  
  SYSTEM_VIEW_OCEAN: {
    icon: 'SYSTEM_VIEW_OCEAN',
    title: 'Ocean View',
    subtitle: 'Breathtaking sea views',
    category: 'view'
  },
  
  SYSTEM_SHARED_HOME: {
    icon: 'SYSTEM_SHARED_HOME',
    title: 'Shared Space',
    subtitle: 'Common areas available',
    category: 'accommodation'
  },
  
  SYSTEM_EARTH_HOUSE: {
    icon: 'SYSTEM_EARTH_HOUSE',
    title: 'Eco-Friendly',
    subtitle: 'Sustainable accommodation',
    category: 'accommodation'
  },
  
  SYSTEM_MESSAGE_READ: {
    icon: 'SYSTEM_MESSAGE_READ',
    title: 'Quick Response',
    subtitle: 'Host responds within hours',
    category: 'host'
  },
  
  SYSTEM_WORKSPACE: {
    icon: 'SYSTEM_WORKSPACE',
    title: 'Dedicated Workspace',
    subtitle: 'Perfect for remote work',
    category: 'amenity'
  },
  
  SYSTEM_PETS: {
    icon: 'SYSTEM_PETS',
    title: 'Pet Friendly',
    subtitle: 'Pets welcome',
    category: 'policy'
  },
  
  SYSTEM_GYM: {
    icon: 'SYSTEM_GYM',
    title: 'Fitness Center',
    subtitle: 'On-site gym facilities',
    category: 'amenity'
  },
  
  SYSTEM_WHY_HOST: {
    icon: 'SYSTEM_WHY_HOST',
    title: 'Experienced Host',
    subtitle: 'Years of hosting experience',
    category: 'host'
  },
  
  SYSTEM_SUPERHOST: {
    icon: 'SYSTEM_SUPERHOST',
    title: 'Superhost',
    subtitle: 'Exceptional hospitality',
    category: 'host'
  },
  
  SYSTEM_BED_KING: {
    icon: 'SYSTEM_BED_KING',
    title: 'King Size Bed',
    subtitle: 'Luxurious sleeping comfort',
    category: 'amenity'
  },
  
  SYSTEM_SHOWER: {
    icon: 'SYSTEM_SHOWER',
    title: 'Premium Shower',
    subtitle: 'High-quality bathroom fixtures',
    category: 'amenity'
  },
  
  SYSTEM_GLOBE_STAND: {
    icon: 'SYSTEM_GLOBE_STAND',
    title: 'Cultural Experience',
    subtitle: 'Immerse in local culture',
    category: 'location'
  },
  
  SYSTEM_VIEW_MOUNTAIN: {
    icon: 'SYSTEM_VIEW_MOUNTAIN',
    title: 'Mountain View',
    subtitle: 'Spectacular mountain scenery',
    category: 'view'
  },
  
  SYSTEM_PRIVATE_BEDROOM: {
    icon: 'SYSTEM_PRIVATE_BEDROOM',
    title: 'Private Room',
    subtitle: 'Your own private space',
    category: 'accommodation'
  },
  
  SYSTEM_NATURE_PARK: {
    icon: 'SYSTEM_NATURE_PARK',
    title: 'Nature Access',
    subtitle: 'Close to natural attractions',
    category: 'location'
  },
  
  SYSTEM_HOST_LISTING_RESIDENTIAL: {
    icon: 'SYSTEM_HOST_LISTING_RESIDENTIAL',
    title: 'Residential Area',
    subtitle: 'Quiet neighborhood setting',
    category: 'location'
  },
  
  SYSTEM_KEY: {
    icon: 'SYSTEM_KEY',
    title: 'Self Check-in',
    subtitle: 'Keyless entry available',
    category: 'policy'
  },
  
  SYSTEM_PALM_TREE: {
    icon: 'SYSTEM_PALM_TREE',
    title: 'Tropical Setting',
    subtitle: 'Paradise location',
    category: 'location'
  },
  
  SYSTEM_LOCATION: {
    icon: 'SYSTEM_LOCATION',
    title: 'Prime Location',
    subtitle: 'Central and convenient',
    category: 'location'
  },
  
  SYSTEM_COFFEE_MAKER: {
    icon: 'SYSTEM_COFFEE_MAKER',
    title: 'Coffee Station',
    subtitle: 'Fresh coffee available',
    category: 'amenity'
  }
};

// Helper function to get highlight by icon name
export function getPropertyHighlight(iconName: string): PropertyHighlightMapping | null {
  return PROPERTY_HIGHLIGHTS_MAP[iconName] || null;
}

// Helper function to get highlights by category
export function getHighlightsByCategory(category: PropertyHighlightMapping['category']): PropertyHighlightMapping[] {
  return Object.values(PROPERTY_HIGHLIGHTS_MAP).filter(highlight => highlight.category === category);
}

// Helper function to format highlights for API response
export function formatHighlightsForAPI(iconNames: string[]): PropertyHighlightMapping[] {
  return iconNames
    .map(iconName => getPropertyHighlight(iconName))
    .filter((highlight): highlight is PropertyHighlightMapping => highlight !== null);
}

// Categories for organizing highlights
export const HIGHLIGHT_CATEGORIES = {
  amenity: 'Amenities',
  view: 'Views & Scenery',
  accommodation: 'Accommodation Type',
  location: 'Location Features',
  host: 'Host Quality',
  policy: 'Booking Policies'
} as const;