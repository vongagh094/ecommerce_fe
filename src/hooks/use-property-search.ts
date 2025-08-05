"use client"

import { useState, useCallback } from 'react'
import { propertyApi } from '@/lib/api'
import { SearchParams, FilterParams, PropertyCard } from '@/types'
import { useLazyLoading } from './use-lazy-loading'

interface UsePropertySearchResult {
  properties: PropertyCard[]
  displayedProperties: PropertyCard[]
  loading: boolean
  error: string | null
  hasMore: boolean
  total: number
  search: (params: SearchParams) => Promise<void>
  filter: (params: FilterParams) => Promise<void>
  loadMore: () => Promise<void>
  showMore: () => void
  canShowMore: boolean
  reset: () => void
}

export function usePropertySearch(): UsePropertySearchResult {
  const [currentParams, setCurrentParams] = useState<SearchParams | FilterParams>({})
  const [searchType, setSearchType] = useState<'search' | 'filter'>('search')

  // Create fetch function for lazy loading
  const fetchProperties = useCallback(async (page: number, limit: number) => {
    const isFilter = searchType === 'filter'
    const response = isFilter 
      ? await propertyApi.filter({ ...currentParams as FilterParams, page, limit })
      : await propertyApi.search({ ...currentParams, page, limit })

    return {
      items: response.properties,
      total: response.total,
      hasMore: response.has_more
    }
  }, [currentParams, searchType])

  const {
    items: properties,
    displayedItems: displayedProperties,
    loading,
    error,
    hasMore,
    total,
    loadMore,
    showMore,
    canShowMore,
    reset: resetLazyLoading
  } = useLazyLoading({
    fetchFunction: fetchProperties,
    initialLimit: 40,
    displayLimit: 20
  })

  const search = useCallback(async (params: SearchParams) => {
    setCurrentParams(params)
    setSearchType('search')
    resetLazyLoading()
    // The lazy loading hook will automatically trigger the first load
  }, [resetLazyLoading])

  const filter = useCallback(async (params: FilterParams) => {
    setCurrentParams(params)
    setSearchType('filter')
    resetLazyLoading()
    // The lazy loading hook will automatically trigger the first load
  }, [resetLazyLoading])

  const reset = useCallback(() => {
    setCurrentParams({})
    setSearchType('search')
    resetLazyLoading()
  }, [resetLazyLoading])

  return {
    properties,
    displayedProperties,
    loading,
    error: error || null,
    hasMore,
    total,
    search,
    filter,
    loadMore,
    showMore,
    canShowMore,
    reset
  }
}