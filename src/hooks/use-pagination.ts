"use client"

import { useState, useCallback } from 'react'
import { propertyApi } from '@/lib/api'
import { SearchParams, FilterParams, PropertyCard, PropertyDetails } from '@/types'

interface UsePaginationResult {
  properties: PropertyCard[]
  loading: boolean
  error: string | null
  currentPage: number
  totalPages: number
  total: number
  hasNext: boolean
  hasPrev: boolean
  search: (params: SearchParams) => Promise<void>
  filter: (params: FilterParams) => Promise<void>
  goToPage: (page: number) => Promise<void>
  nextPage: () => Promise<void>
  prevPage: () => Promise<void>
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

export function usePagination(): UsePaginationResult {
  const [properties, setProperties] = useState<PropertyCard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [currentParams, setCurrentParams] = useState<SearchParams | FilterParams>({})
  const [isFilter, setIsFilter] = useState(false)

  const limit = 20 // Items per page

  const fetchPage = useCallback(async (page: number, params: SearchParams | FilterParams, isFilterMode = false) => {
    setLoading(true)
    setError(null)

    try {
      const searchParams = {
        ...params,
        page,
        limit
      }

      console.log('Fetching page:', page, 'with params:', searchParams)

      const response = isFilterMode 
        ? await propertyApi.filter(searchParams as FilterParams)
        : await propertyApi.search(searchParams)

      // Transform PropertyDetails to PropertyCard
      const propertyCards = (response.properties || []).map(transformToPropertyCard)
      
      setProperties(propertyCards)
      setCurrentPage(page)
      setTotal(response.total || 0)
      setTotalPages(Math.ceil((response.total || 0) / limit))

      console.log('Page loaded:', {
        page,
        propertiesCount: response.properties?.length || 0,
        total: response.total,
        totalPages: Math.ceil((response.total || 0) / limit)
      })
    } catch (err) {
      console.error('Error fetching page:', err)
      setError(err instanceof Error ? err.message : 'Failed to load properties')
      setProperties([])
    } finally {
      setLoading(false)
    }
  }, [])

  const search = useCallback(async (params: SearchParams) => {
    console.log('Starting search with params:', params)
    setCurrentParams(params)
    setIsFilter(false)
    await fetchPage(1, params, false)
  }, [fetchPage])

  const filter = useCallback(async (params: FilterParams) => {
    console.log('Starting filter with params:', params)
    setCurrentParams(params)
    setIsFilter(true)
    await fetchPage(1, params, true)
  }, [fetchPage])

  const goToPage = useCallback(async (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return
    await fetchPage(page, currentParams, isFilter)
  }, [fetchPage, totalPages, currentPage, currentParams, isFilter])

  const nextPage = useCallback(async () => {
    if (currentPage < totalPages) {
      await goToPage(currentPage + 1)
    }
  }, [currentPage, totalPages, goToPage])

  const prevPage = useCallback(async () => {
    if (currentPage > 1) {
      await goToPage(currentPage - 1)
    }
  }, [currentPage, goToPage])

  const reset = useCallback(() => {
    setProperties([])
    setCurrentPage(1)
    setTotalPages(0)
    setTotal(0)
    setCurrentParams({})
    setIsFilter(false)
    setError(null)
    setLoading(false)
  }, [])

  return {
    properties,
    loading,
    error,
    currentPage,
    totalPages,
    total,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    search,
    filter,
    goToPage,
    nextPage,
    prevPage,
    reset
  }
}