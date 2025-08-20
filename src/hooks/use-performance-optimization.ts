"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

interface PerformanceMetrics {
  memoryUsage: number
  renderTime: number
  imageLoadTime: number
  scrollPerformance: number
}

interface UsePerformanceOptimizationProps {
  enableImageOptimization?: boolean
  enableMemoryMonitoring?: boolean
  enableRenderOptimization?: boolean
  maxMemoryUsage?: number // MB
}

interface UsePerformanceOptimizationResult {
  metrics: PerformanceMetrics
  optimizeImage: (src: string, width?: number, quality?: number) => string
  preloadImage: (src: string) => Promise<void>
  clearImageCache: () => void
  isLowMemory: boolean
  performanceScore: 'excellent' | 'good' | 'fair' | 'poor'
}

// Image cache for preloading
const imageCache = new Map<string, HTMLImageElement>()
const preloadPromises = new Map<string, Promise<void>>()

export function usePerformanceOptimization({
  enableImageOptimization = true,
  enableMemoryMonitoring = true,
  enableRenderOptimization = true,
  maxMemoryUsage = 100 // 100MB default
}: UsePerformanceOptimizationProps = {}): UsePerformanceOptimizationResult {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: 0,
    renderTime: 0,
    imageLoadTime: 0,
    scrollPerformance: 0
  })
  
  const [isLowMemory, setIsLowMemory] = useState(false)
  const renderStartTime = useRef<number>(0)
  const memoryCheckInterval = useRef<NodeJS.Timeout | null>(null)

  // Memory monitoring
  const checkMemoryUsage = useCallback(() => {
    if (!enableMemoryMonitoring || typeof window === 'undefined') return

    // Use Performance API if available
    if ('memory' in performance) {
      const memory = (performance as any).memory
      const usedMB = memory.usedJSHeapSize / 1024 / 1024
      
      setMetrics(prev => ({
        ...prev,
        memoryUsage: usedMB
      }))
      
      setIsLowMemory(usedMB > maxMemoryUsage)
      
      // Clear image cache if memory is high
      if (usedMB > maxMemoryUsage * 0.8) {
        clearImageCache()
      }
    }
  }, [enableMemoryMonitoring, maxMemoryUsage])

  // Image optimization
  const optimizeImage = useCallback((
    src: string, 
    width?: number, 
    quality: number = 75
  ): string => {
    if (!enableImageOptimization) return src

    // For Next.js Image optimization
    if (src.startsWith('/') || src.includes(window.location.hostname)) {
      const params = new URLSearchParams()
      if (width) params.set('w', width.toString())
      params.set('q', quality.toString())
      
      return `${src}${src.includes('?') ? '&' : '?'}${params.toString()}`
    }

    return src
  }, [enableImageOptimization])

  // Image preloading with caching
  const preloadImage = useCallback((src: string): Promise<void> => {
    // Return existing promise if already preloading
    if (preloadPromises.has(src)) {
      return preloadPromises.get(src)!
    }

    // Return resolved promise if already cached
    if (imageCache.has(src)) {
      return Promise.resolve()
    }

    const startTime = performance.now()
    
    const promise = new Promise<void>((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        const loadTime = performance.now() - startTime
        setMetrics(prev => ({
          ...prev,
          imageLoadTime: (prev.imageLoadTime + loadTime) / 2 // Moving average
        }))
        
        imageCache.set(src, img)
        preloadPromises.delete(src)
        resolve()
      }
      
      img.onerror = () => {
        preloadPromises.delete(src)
        reject(new Error(`Failed to preload image: ${src}`))
      }
      
      img.src = src
    })

    preloadPromises.set(src, promise)
    return promise
  }, [])

  // Clear image cache
  const clearImageCache = useCallback(() => {
    imageCache.clear()
    preloadPromises.clear()
  }, [])

  // Render performance tracking
  useEffect(() => {
    if (!enableRenderOptimization) return

    renderStartTime.current = performance.now()
    
    return () => {
      const renderTime = performance.now() - renderStartTime.current
      setMetrics(prev => ({
        ...prev,
        renderTime: (prev.renderTime + renderTime) / 2 // Moving average
      }))
    }
  })

  // Scroll performance monitoring
  useEffect(() => {
    if (!enableRenderOptimization || typeof window === 'undefined') return

    let lastScrollTime = performance.now()
    let frameCount = 0
    let totalFrameTime = 0

    const handleScroll = () => {
      const currentTime = performance.now()
      const frameTime = currentTime - lastScrollTime
      
      frameCount++
      totalFrameTime += frameTime
      
      // Update scroll performance every 10 frames
      if (frameCount >= 10) {
        const avgFrameTime = totalFrameTime / frameCount
        const fps = 1000 / avgFrameTime
        
        setMetrics(prev => ({
          ...prev,
          scrollPerformance: fps
        }))
        
        frameCount = 0
        totalFrameTime = 0
      }
      
      lastScrollTime = currentTime
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [enableRenderOptimization])

  // Memory monitoring interval
  useEffect(() => {
    if (!enableMemoryMonitoring) return

    checkMemoryUsage() // Initial check
    
    memoryCheckInterval.current = setInterval(checkMemoryUsage, 5000) // Check every 5 seconds
    
    return () => {
      if (memoryCheckInterval.current) {
        clearInterval(memoryCheckInterval.current)
      }
    }
  }, [checkMemoryUsage, enableMemoryMonitoring])

  // Calculate performance score
  const performanceScore = useCallback((): 'excellent' | 'good' | 'fair' | 'poor' => {
    const { memoryUsage, renderTime, scrollPerformance } = metrics
    
    let score = 100
    
    // Memory usage penalty
    if (memoryUsage > maxMemoryUsage) score -= 30
    else if (memoryUsage > maxMemoryUsage * 0.8) score -= 15
    
    // Render time penalty
    if (renderTime > 100) score -= 25
    else if (renderTime > 50) score -= 10
    
    // Scroll performance penalty
    if (scrollPerformance < 30) score -= 25
    else if (scrollPerformance < 45) score -= 10
    
    if (score >= 85) return 'excellent'
    if (score >= 70) return 'good'
    if (score >= 50) return 'fair'
    return 'poor'
  }, [metrics, maxMemoryUsage])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (memoryCheckInterval.current) {
        clearInterval(memoryCheckInterval.current)
      }
      clearImageCache()
    }
  }, [clearImageCache])

  return {
    metrics,
    optimizeImage,
    preloadImage,
    clearImageCache,
    isLowMemory,
    performanceScore: performanceScore()
  }
}

// Utility function for debouncing
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Utility function for throttling
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now()
    
    if (now - lastCall.current >= delay) {
      lastCall.current = now
      return callback(...args)
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      timeoutRef.current = setTimeout(() => {
        lastCall.current = Date.now()
        callback(...args)
      }, delay - (now - lastCall.current))
    }
  }, [callback, delay]) as T
}