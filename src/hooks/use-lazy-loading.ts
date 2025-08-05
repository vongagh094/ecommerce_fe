"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseLazyLoadingProps<T> {
  fetchFunction: (page: number, limit: number) => Promise<{
    items: T[]
    total: number
    hasMore: boolean
  }>
  initialLimit?: number
  displayLimit?: number
}

interface UseLazyLoadingResult<T> {
  items: T[]
  displayedItems: T[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
  showMore: () => void
  canShowMore: boolean
  reset: () => void
  total: number
}

export function useLazyLoading<T>({
  fetchFunction,
  initialLimit = 40,
  displayLimit = 20
}: UseLazyLoadingProps<T>): UseLazyLoadingResult<T> {
  const [items, setItems] = useState<T[]>([])
  const [displayedItems, setDisplayedItems] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [displayCount, setDisplayCount] = useState(displayLimit)
  
  const isInitialLoad = useRef(true)

  // Load more items from API
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    setError(null)

    try {
      const result = await fetchFunction(currentPage, initialLimit)
      
      setItems(prev => [...prev, ...result.items])
      setTotal(result.total)
      setHasMore(result.hasMore)
      setCurrentPage(prev => prev + 1)
      
      // If this is initial load, set displayed items
      if (isInitialLoad.current) {
        setDisplayedItems(result.items.slice(0, displayLimit))
        isInitialLoad.current = false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items')
    } finally {
      setLoading(false)
    }
  }, [fetchFunction, currentPage, initialLimit, displayLimit, loading, hasMore])

  // Show more items from already loaded items
  const showMore = useCallback(() => {
    const newDisplayCount = displayCount + displayLimit
    setDisplayCount(newDisplayCount)
    setDisplayedItems(items.slice(0, newDisplayCount))
    
    // If we're running low on loaded items, load more from API
    if (newDisplayCount >= items.length - displayLimit && hasMore) {
      loadMore()
    }
  }, [displayCount, displayLimit, items, hasMore, loadMore])

  // Check if we can show more items from already loaded items
  const canShowMore = displayedItems.length < items.length

  // Update displayed items when items change
  useEffect(() => {
    if (items.length > 0) {
      setDisplayedItems(items.slice(0, displayCount))
    }
  }, [items, displayCount])

  // Reset all state
  const reset = useCallback(() => {
    setItems([])
    setDisplayedItems([])
    setLoading(false)
    setError(null)
    setHasMore(true)
    setTotal(0)
    setCurrentPage(1)
    setDisplayCount(displayLimit)
    isInitialLoad.current = true
  }, [displayLimit])

  // Initial load
  useEffect(() => {
    if (isInitialLoad.current) {
      loadMore()
    }
  }, []) // Only run once on mount

  return {
    items,
    displayedItems,
    loading,
    error,
    hasMore: hasMore || canShowMore,
    loadMore,
    showMore,
    canShowMore,
    reset,
    total
  }
}