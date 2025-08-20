"use client"

import { useState } from "react"
import {
    Wifi,
    Car,
    Tv,
    Coffee,
    Waves,
    Wind,
    Utensils,
    Shirt,
    Home,
    Bed,
    Bath,
    Thermometer,
    Shield,
    MapPin,
    Eye,
    Gamepad2,
    Users,
    Snowflake,
    Flame,
    Zap,
    Droplets,
    TreePine,
    Mountain,
    Building,
    Sparkles,
    Star,
    CheckCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Amenity } from "@/types"

interface EnhancedPropertyAmenitiesProps {
    amenities: Amenity[]
}

// Enhanced category-based icon mapping
const getCategoryIcon = (category: string) => {
    const categoryIconMap: { [key: string]: React.ComponentType<any> } = {
        // Basic amenities
        'basic': Home,
        'essentials': CheckCircle,

        // Family & bedroom
        'family': Users,
        'bedroom': Bed,
        'bedroom_and_laundry': Bed,

        // Outdoor
        'outdoor': TreePine,
        'outdoor_activities': Mountain,

        // Home safety
        'home_safety': Shield,
        'safety': Shield,

        // Heating and cooling
        'heating_and_cooling': Thermometer,
        'heating': Flame,
        'cooling': Snowflake,

        // Location features
        'location_features': MapPin,
        'location': MapPin,

        // Kitchen and dining
        'kitchen_and_dining': Utensils,
        'kitchen': Utensils,
        'dining': Utensils,

        // Scenic views
        'scenic_views': Eye,
        'views': Eye,

        // Services
        'services': Sparkles,
        'service': Sparkles,

        // Entertainment
        'entertainment': Gamepad2,

        // Bathroom
        'bathroom': Bath,

        // Internet & Technology
        'internet': Wifi,
        'technology': Tv,

        // Parking & Transportation
        'parking': Car,
        'transportation': Car,

        // Pool & Water
        'pool': Waves,
        'water': Droplets,

        // Default
        'default': Star
    }

    const key = category.toLowerCase().replace(/\s+/g, '_')
    return categoryIconMap[key] || categoryIconMap['default']
}

// Specific amenity icon mapping (fallback for individual amenities)
const getAmenityIcon = (name: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
        // Internet & Tech
        'wifi': Wifi,
        'internet': Wifi,
        'tv': Tv,
        'television': Tv,

        // Transportation
        'parking': Car,
        'free parking': Car,
        'garage': Car,

        // Kitchen & Dining
        'coffee': Coffee,
        'coffee maker': Coffee,
        'kitchen': Utensils,
        'dining': Utensils,
        'refrigerator': Utensils,
        'microwave': Utensils,

        // Water & Pool
        'pool': Waves,
        'swimming pool': Waves,
        'hot tub': Waves,
        'jacuzzi': Waves,

        // Climate
        'air conditioning': Wind,
        'ac': Wind,
        'heating': Flame,
        'fireplace': Flame,

        // Laundry
        'washer': Shirt,
        'dryer': Shirt,
        'laundry': Shirt,

        // Bedroom
        'bed': Bed,
        'bedroom': Bed,

        // Bathroom
        'bathroom': Bath,
        'shower': Bath,
        'bathtub': Bath,

        // Safety
        'smoke detector': Shield,
        'carbon monoxide detector': Shield,
        'fire extinguisher': Shield,
        'first aid kit': Shield,

        // Outdoor
        'balcony': TreePine,
        'patio': TreePine,
        'garden': TreePine,
        'bbq': TreePine,

        // Views
        'ocean view': Eye,
        'mountain view': Eye,
        'city view': Eye,
        'garden view': Eye,

        // Entertainment
        'games': Gamepad2,
        'books': Gamepad2,
        'music': Gamepad2,

        // Services
        'cleaning': Sparkles,
        'concierge': Sparkles,
        'room service': Sparkles,
    }

    const key = name.toLowerCase()
    return iconMap[key] || Star
}

// Category display names mapping
const getCategoryDisplayName = (category: string): string => {
    const categoryNames: { [key: string]: string } = {
        'basic': 'Basic Amenities',
        'essentials': 'Essentials',
        'family': 'Family',
        'bedroom_and_laundry': 'Bedroom & Laundry',
        'bedroom': 'Bedroom',
        'outdoor': 'Outdoor',
        'home_safety': 'Home Safety',
        'safety': 'Safety',
        'heating_and_cooling': 'Heating & Cooling',
        'location_features': 'Location Features',
        'kitchen_and_dining': 'Kitchen & Dining',
        'scenic_views': 'Scenic Views',
        'services': 'Services',
        'entertainment': 'Entertainment',
        'bathroom': 'Bathroom',
        'internet': 'Internet & Technology',
        'parking': 'Parking & Transportation',
        'pool': 'Pool & Water Features'
    }

    const key = category.toLowerCase().replace(/\s+/g, '_')
    return categoryNames[key] || category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export function EnhancedPropertyAmenities({ amenities }: EnhancedPropertyAmenitiesProps) {
    const [showAllAmenities, setShowAllAmenities] = useState(false)

    if (!amenities || amenities.length === 0) {
        return (
            <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">What this place offers</h3>
                <p className="text-gray-500">No amenities information available.</p>
            </div>
        )
    }

    // Group amenities by category
    const groupedAmenities = amenities.reduce((acc, amenity) => {
        const category = amenity.category || 'other'
        if (!acc[category]) {
            acc[category] = []
        }
        acc[category].push(amenity)
        return acc
    }, {} as { [key: string]: Amenity[] })

    // Show first 10 amenities on main view
    const displayAmenities = amenities.slice(0, 10)
    const hasMoreAmenities = amenities.length > 10

    return (
        <>
            <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">What this place offers</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayAmenities.map((amenity) => {
                        const IconComponent = getAmenityIcon(amenity.name)

                        return (
                            <div key={amenity.id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="text-gray-600 flex-shrink-0">
                                    <IconComponent className="h-5 w-5" />
                                </div>
                                <span className="text-gray-900 flex-1">{amenity.name}</span>
                            </div>
                        )
                    })}
                </div>

                {hasMoreAmenities && (
                    <div className="mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setShowAllAmenities(true)}
                            className="border-gray-900 text-gray-900 hover:bg-gray-50"
                        >
                            Show all {amenities.length} amenities
                        </Button>
                    </div>
                )}
            </div>

            {/* All Amenities Modal */}
            <Dialog open={showAllAmenities} onOpenChange={setShowAllAmenities}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>What this place offers</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-8">
                        {Object.entries(groupedAmenities)
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([category, categoryAmenities]) => {
                                const CategoryIcon = getCategoryIcon(category)

                                return (
                                    <div key={category} className="space-y-4">
                                        {/* Category Header */}
                                        <div className="flex items-center space-x-3 pb-2 border-b border-gray-200">
                                            <CategoryIcon className="h-5 w-5 text-gray-600" />
                                            <h4 className="font-semibold text-gray-900 text-lg">
                                                {getCategoryDisplayName(category)}
                                            </h4>
                                            <span className="text-sm text-gray-500">
                                                ({categoryAmenities.length})
                                            </span>
                                        </div>

                                        {/* Category Amenities */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {categoryAmenities.map((amenity) => {
                                                const AmenityIcon = getAmenityIcon(amenity.name)

                                                return (
                                                    <div key={amenity.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                                        <div className="text-gray-600 flex-shrink-0">
                                                            <AmenityIcon className="h-4 w-4" />
                                                        </div>
                                                        <span className="text-gray-900 flex-1">{amenity.name}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}