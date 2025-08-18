"use client"

import { useState, useCallback } from 'react'
import { propertyApi } from '@/lib/api'
import { SearchParams, FilterParams, PropertyCard, PropertyDetails } from '@/types'

interface UsePaginatedPropertySearchResult {
    properties: PropertyCard[]
    loading: boolean
    error: unknown
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    search: (params: SearchParams, page?: number) => void
    filter: (params: FilterParams, page?: number) => void
    goToPage: (page: number) => void
    reset: () => void
}

// Helper function to transform PropertyDetails to PropertyCard
const transformToPropertyCard = (property: PropertyDetails): PropertyCard => {
    return {
        id: property.id,
        title: property.title,
        images: property.images || [],
        base_price: property.pricing?.base_price || 0,
        location: {
            city: property.location?.city || '',
            state: property.location?.state || '',
            country: property.location?.country || ''
        },
        rating: {
            average: property.reviews?.average_rating || 0,
            count: property.reviews?.total_reviews || 0
        },
        property_type: property.property_type || '',
        max_guests: property.max_guests || 0,
        is_guest_favorite: false, // Default value, can be updated if available in the API
        host: {
            id: property.host?.id || '',
            full_name: property.host?.full_name || '',
            is_super_host: property.host?.is_super_host || false
        }
    }
}

export function usePaginatedPropertySearch(defaultItemsPerPage = 40): UsePaginatedPropertySearchResult {
    const [properties, setProperties] = useState<PropertyCard[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage)
    const [currentParams, setCurrentParams] = useState<SearchParams | FilterParams>({})
    const [isFilter, setIsFilter] = useState(false)

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / itemsPerPage)

    // Fetch properties function
    const fetchProperties = useCallback(async (params: SearchParams | FilterParams, page: number = 1) => {
        setLoading(true)
        setError(null)
        
        try {
            const fetchParams = {
                ...params,
                page,
                limit: itemsPerPage
            }
            
            console.log(`Fetching properties for page ${page} with params:`, fetchParams, 'isFilter:', isFilter)
            
            const response = isFilter
                ? await propertyApi.filter(fetchParams as FilterParams)
                : await propertyApi.search(fetchParams)
            
            console.log('API Response:', {
                page,
                totalItems: response.total,
                itemsCount: response?.properties?.length || 0,
                hasMore: response?.has_more
            })
            
            // Transform PropertyDetails to PropertyCard
            const propertyCards = (response.properties || []).map(transformToPropertyCard)
            
            setProperties(propertyCards)
            setTotalItems(response.total || 0)
            setCurrentPage(page)
            
            return response
        } catch (error) {
            console.error('Error fetching properties:', error)
            setError(error)
            return null
        } finally {
            setLoading(false)
        }
    }, [isFilter, itemsPerPage])

    // Search function
    const search = useCallback((params: SearchParams, page: number = 1) => {
        console.log('Starting new search with params:', params, 'page:', page)
        
        // Only update current params if this is a new search, not just a page change
        if (page === 1 || !isFilter) {
            setCurrentParams(params)
            setIsFilter(false)
        }
        
        fetchProperties(params, page)
    }, [fetchProperties, isFilter])

    // Filter function
    const filter = useCallback((params: FilterParams, page: number = 1) => {
        console.log('Starting new filter with params:', params, 'page:', page)
        
        // Only update current params if this is a new filter, not just a page change
        if (page === 1 || isFilter) {
            setCurrentParams(params)
            setIsFilter(true)
        }
        
        fetchProperties(params, page)
    }, [fetchProperties, isFilter])

    // Go to page function
    const goToPage = useCallback((page: number) => {
        if (page < 1 || page > totalPages || page === currentPage) return
        
        console.log(`Going to page ${page}`)
        if (isFilter) {
            filter(currentParams as FilterParams, page)
        } else {
            search(currentParams as SearchParams, page)
        }
    }, [currentParams, currentPage, totalPages, filter, search, isFilter])

    // Reset function
    const reset = useCallback(() => {
        setProperties([])
        setCurrentPage(1)
        setTotalItems(0)
        setCurrentParams({})
        setIsFilter(false)
        setError(null)
    }, [])

    return {
        properties,
        loading,
        error,
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        search,
        filter,
        goToPage,
        reset
    }
}