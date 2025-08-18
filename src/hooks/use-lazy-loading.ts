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
  maxCachedItems?: number // Maximum items to keep in memory
  enableVirtualization?: boolean
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
  currentPage: number
  memoryUsage: {
    cachedItems: number
    maxCached: number
    memoryPressure: 'low' | 'medium' | 'high'
  }
}

export function useLazyLoading<T>({
  fetchFunction,
  initialLimit = 40,
  displayLimit = 20,
  maxCachedItems = 1000,
  enableVirtualization = true
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
  const abortControllerRef = useRef<AbortController | null>(null)
  const memoryCleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Memory management functions
  const getMemoryPressure = useCallback((itemCount: number): 'low' | 'medium' | 'high' => {
    const ratio = itemCount / maxCachedItems
    if (ratio < 0.5) return 'low'
    if (ratio < 0.8) return 'medium'
    return 'high'
  }, [maxCachedItems])

  const cleanupOldItems = useCallback(() => {
    setItems(prev => {
      if (prev.length <= maxCachedItems) return prev
      
      // Keep the most recent items and some from the beginning for smooth scrolling
      const keepFromEnd = Math.floor(maxCachedItems * 0.7)
      const keepFromStart = Math.floor(maxCachedItems * 0.3)
      
      const recentItems = prev.slice(-keepFromEnd)
      const initialItems = prev.slice(0, keepFromStart)
      
      return [...initialItems, ...recentItems]
    })
  }, [maxCachedItems])

  // Enhanced load more with memory management and abort control
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    setLoading(true)
    setError(null)

    try {
      const result = await fetchFunction(currentPage, initialLimit)
      
      // Check if request was aborted
      if (abortController.signal.aborted) return

      setItems(prev => {
        const newItems = [...prev, ...result.items]
        
        // Trigger memory cleanup if needed
        if (newItems.length > maxCachedItems) {
          if (memoryCleanupTimeoutRef.current) {
            clearTimeout(memoryCleanupTimeoutRef.current)
          }
          memoryCleanupTimeoutRef.current = setTimeout(cleanupOldItems, 1000)
        }
        
        return newItems
      })
      
      setTotal(result.total)
      setHasMore(result.hasMore)
      setCurrentPage(prev => prev + 1)
      
      // If this is initial load, set displayed items
      if (isInitialLoad.current) {
        setDisplayedItems(result.items.slice(0, displayLimit))
        isInitialLoad.current = false
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return // Request was cancelled, don't set error
      }
      setError(err instanceof Error ? err.message : 'Failed to load items')
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false)
      }
    }
  }, [fetchFunction, currentPage, initialLimit, displayLimit, loading, hasMore, maxCachedItems, cleanupOldItems])

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

  // Enhanced reset with cleanup
  const reset = useCallback(() => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Clear cleanup timeouts
    if (memoryCleanupTimeoutRef.current) {
      clearTimeout(memoryCleanupTimeoutRef.current)
    }

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (memoryCleanupTimeoutRef.current) {
        clearTimeout(memoryCleanupTimeoutRef.current)
      }
    }
  }, [])

  // Initial load
  useEffect(() => {
    if (isInitialLoad.current) {
      console.log('useLazyLoading: Triggering initial load')
      // Call loadMore directly to avoid dependency issues
      const initialLoad = async () => {
        if (loading || !hasMore) return

        setLoading(true)
        setError(null)

        try {
          const result = await fetchFunction(1, initialLimit)
          
          setItems(result.items)
          setDisplayedItems(result.items.slice(0, displayLimit))
          setTotal(result.total)
          setHasMore(result.hasMore)
          setCurrentPage(2) // Next page will be 2
          isInitialLoad.current = false
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to load items')
        } finally {
          setLoading(false)
        }
      }

      initialLoad()
    }
  }, [fetchFunction, initialLimit, displayLimit]) // Only include stable dependencies

  // Memory usage statistics
  const memoryUsage = {
    cachedItems: items.length,
    maxCached: maxCachedItems,
    memoryPressure: getMemoryPressure(items.length)
  }

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
    total,
    currentPage,
    memoryUsage
  }
}