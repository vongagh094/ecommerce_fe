"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Sliders, DollarSign, Home, Star, Wifi, Car, Waves } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { propertyApi } from "@/lib/api"
import { FilterParams } from "@/types"

interface AdvancedFiltersModalProps {
    isOpen: boolean
    onClose: () => void
    onApplyFilters: (filters: FilterParams) => void
    currentFilters: FilterParams
    location?: string
}

interface FilterMetadata {
    price_range: {
        min: number
        max: number
        average: number
        currency: string
    }
    property_types: {
        type: string
        display_name: string
        count: number
    }[]
    popular_amenities: {
        id: string
        name: string
        count: number
    }[]
    rating_distribution: {
        [rating: string]: number
    }
}

const PROPERTY_TYPE_ICONS: { [key: string]: React.ComponentType<any> } = {
    'apartment': Home,
    'house': Home,
    'villa': Home,
    'condo': Home,
    'townhouse': Home,
    'default': Home
}

const AMENITY_ICONS: { [key: string]: React.ComponentType<any> } = {
    'wifi': Wifi,
    'parking': Car,
    'pool': Waves,
    'default': Star
}

export function AdvancedFiltersModal({
    isOpen,
    onClose,
    onApplyFilters,
    currentFilters,
    location
}: AdvancedFiltersModalProps) {
    const [filters, setFilters] = useState<FilterParams>(currentFilters)
    const [metadata, setMetadata] = useState<FilterMetadata | null>(null)
    const [loading, setLoading] = useState(false)
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])

    // Load filter metadata
    useEffect(() => {
        if (isOpen) {
            loadFilterMetadata()
        }
    }, [isOpen, location])

    const loadFilterMetadata = async () => {
        setLoading(true)
        try {
            const data = await propertyApi.getSearchFilters(location) as FilterMetadata
            setMetadata(data)

            // Initialize price range from metadata
            if (data.price_range) {
                setPriceRange([
                    filters.min_price || data.price_range.min,
                    filters.max_price || data.price_range.max
                ])
            }
        } catch (error) {
            console.error('Failed to load filter metadata:', error)
        } finally {
            setLoading(false)
        }
    }

    const handlePriceRangeChange = useCallback((newRange: [number, number]) => {
        setPriceRange(newRange)
        setFilters(prev => ({
            ...prev,
            min_price: newRange[0],
            max_price: newRange[1]
        }))
    }, [])

    const handlePropertyTypeToggle = (type: string) => {
        setFilters(prev => {
            const currentTypes = prev.property_types || []
            const newTypes = currentTypes.includes(type)
                ? currentTypes.filter(t => t !== type)
                : [...currentTypes, type]

            return {
                ...prev,
                property_types: newTypes.length > 0 ? newTypes : undefined
            }
        })
    }

    const handleAmenityToggle = (amenityId: string) => {
        setFilters(prev => {
            const currentAmenities = prev.amenities || []
            const newAmenities = currentAmenities.includes(amenityId)
                ? currentAmenities.filter(a => a !== amenityId)
                : [...currentAmenities, amenityId]

            return {
                ...prev,
                amenities: newAmenities.length > 0 ? newAmenities : undefined
            }
        })
    }

    const handleRatingChange = (rating: number) => {
        setFilters(prev => ({
            ...prev,
            min_rating: prev.min_rating === rating ? undefined : rating
        }))
    }

    const handleBedroomChange = (bedrooms: number) => {
        setFilters(prev => ({
            ...prev,
            min_bedrooms: prev.min_bedrooms === bedrooms ? undefined : bedrooms
        }))
    }

    const handleBathroomChange = (bathrooms: number) => {
        setFilters(prev => ({
            ...prev,
            min_bathrooms: prev.min_bathrooms === bathrooms ? undefined : bathrooms
        }))
    }

    const handleBooleanFilterToggle = (key: keyof FilterParams) => {
        setFilters(prev => ({
            ...prev,
            [key]: prev[key] ? undefined : true
        }))
    }

    const clearAllFilters = () => {
        setFilters({
            location: currentFilters.location,
            check_in: currentFilters.check_in,
            check_out: currentFilters.check_out,
            guests: currentFilters.guests
        })
        if (metadata?.price_range) {
            setPriceRange([metadata.price_range.min, metadata.price_range.max])
        }
    }

    const applyFilters = () => {
        onApplyFilters(filters)
        onClose()
    }

    const getActiveFilterCount = () => {
        let count = 0
        if (filters.min_price || filters.max_price) count++
        if (filters.property_types?.length) count++
        if (filters.amenities?.length) count++
        if (filters.min_rating) count++
        if (filters.min_bedrooms) count++
        if (filters.min_bathrooms) count++
        if (filters.superhost_only) count++
        if (filters.instant_book_only) count++
        if (filters.guest_favorites_only) count++
        return count
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Sliders className="h-5 w-5" />
                            <span>Filters</span>
                            {getActiveFilterCount() > 0 && (
                                <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded-full">
                                    {getActiveFilterCount()}
                                </span>
                            )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <span className="ml-2">Loading filters...</span>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Price Range */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <DollarSign className="h-5 w-5 mr-2" />
                                Price range
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-1">
                                        <label className="block text-sm text-gray-600 mb-1">Min price</label>
                                        <input
                                            type="number"
                                            value={priceRange[0]}
                                            onChange={(e) => handlePriceRangeChange([parseInt(e.target.value) || 0, priceRange[1]])}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm text-gray-600 mb-1">Max price</label>
                                        <input
                                            type="number"
                                            value={priceRange[1]}
                                            onChange={(e) => handlePriceRangeChange([priceRange[0], parseInt(e.target.value) || 1000])}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="1000"
                                        />
                                    </div>
                                </div>
                                {metadata?.price_range && (
                                    <p className="text-sm text-gray-600">
                                        Average nightly price: ${metadata.price_range.average}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Property Type */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <Home className="h-5 w-5 mr-2" />
                                Property type
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                {metadata?.property_types?.map((type) => {
                                    const IconComponent = PROPERTY_TYPE_ICONS[type.type] || PROPERTY_TYPE_ICONS.default
                                    const isSelected = filters.property_types?.includes(type.type) || false

                                    return (
                                        <button
                                            key={type.type}
                                            onClick={() => handlePropertyTypeToggle(type.type)}
                                            className={`flex items-center space-x-3 p-3 border rounded-lg transition-colors ${isSelected
                                                ? 'border-gray-900 bg-gray-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                                }`}
                                        >
                                            <IconComponent className="h-5 w-5 text-gray-600" />
                                            <div className="text-left">
                                                <div className="font-medium">{type.display_name}</div>
                                                <div className="text-sm text-gray-500">{type.count} properties</div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <Separator />

                        {/* Rooms and beds */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Rooms and beds</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                                    <div className="flex space-x-2">
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <button
                                                key={num}
                                                onClick={() => handleBedroomChange(num)}
                                                className={`px-4 py-2 border rounded-lg transition-colors ${filters.min_bedrooms === num
                                                    ? 'border-gray-900 bg-gray-900 text-white'
                                                    : 'border-gray-300 hover:border-gray-400'
                                                    }`}
                                            >
                                                {num}+
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                                    <div className="flex space-x-2">
                                        {[1, 2, 3, 4].map((num) => (
                                            <button
                                                key={num}
                                                onClick={() => handleBathroomChange(num)}
                                                className={`px-4 py-2 border rounded-lg transition-colors ${filters.min_bathrooms === num
                                                    ? 'border-gray-900 bg-gray-900 text-white'
                                                    : 'border-gray-300 hover:border-gray-400'
                                                    }`}
                                            >
                                                {num}+
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Amenities */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Amenities</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {metadata?.popular_amenities?.map((amenity) => {
                                    const IconComponent = AMENITY_ICONS[amenity.name.toLowerCase()] || AMENITY_ICONS.default
                                    const isSelected = filters.amenities?.includes(amenity.id) || false

                                    return (
                                        <label
                                            key={amenity.id}
                                            className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${isSelected
                                                ? 'border-gray-900 bg-gray-50'
                                                : 'border-gray-300 hover:border-gray-400'
                                                }`}
                                        >
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => handleAmenityToggle(amenity.id)}
                                            />
                                            <IconComponent className="h-5 w-5 text-gray-600" />
                                            <div className="text-left">
                                                <div className="font-medium">{amenity.name}</div>
                                                <div className="text-sm text-gray-500">{amenity.count} properties</div>
                                            </div>
                                        </label>
                                    )
                                })}
                            </div>
                        </div>

                        <Separator />

                        {/* Host and booking options */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Host and booking</h3>
                            <div className="space-y-3">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <Checkbox
                                        checked={filters.superhost_only || false}
                                        onCheckedChange={() => handleBooleanFilterToggle('superhost_only')}
                                    />
                                    <span>Superhost</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <Checkbox
                                        checked={filters.instant_book_only || false}
                                        onCheckedChange={() => handleBooleanFilterToggle('instant_book_only')}
                                    />
                                    <span>Instant Book</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <Checkbox
                                        checked={filters.guest_favorites_only || false}
                                        onCheckedChange={() => handleBooleanFilterToggle('guest_favorites_only')}
                                    />
                                    <span>Guest favorites</span>
                                </label>
                            </div>
                        </div>

                        <Separator />

                        {/* Rating */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Rating</h3>
                            <div className="flex space-x-2">
                                {[3, 4, 4.5].map((rating) => (
                                    <button
                                        key={rating}
                                        onClick={() => handleRatingChange(rating)}
                                        className={`flex items-center space-x-1 px-4 py-2 border rounded-lg transition-colors ${filters.min_rating === rating
                                            ? 'border-gray-900 bg-gray-900 text-white'
                                            : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                    >
                                        <Star className="h-4 w-4 fill-current" />
                                        <span>{rating}+</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-6 border-t">
                    <Button variant="ghost" onClick={clearAllFilters}>
                        Clear all
                    </Button>
                    <div className="flex space-x-3">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={applyFilters} className="bg-gray-900 hover:bg-gray-800 text-white">
                            Show results
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}