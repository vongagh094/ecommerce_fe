"use client"

import { useState, useEffect } from 'react'
import { propertyApi } from '@/lib/api'
import { PropertyDetails } from '@/types'

interface UsePropertyDetailsResult {
  property: PropertyDetails | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function usePropertyDetails(propertyId: string): UsePropertyDetailsResult {
  const [property, setProperty] = useState<PropertyDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProperty = async () => {
    if (!propertyId) return

    setLoading(true)
    setError(null)

    try {
      const data = await propertyApi.getDetails(propertyId)
      setProperty(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load property details')
      setProperty(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperty()
  }, [propertyId])

  return {
    property,
    loading,
    error,
    refetch: fetchProperty
  }
}