"use client"

import { useState } from 'react'
import { propertyApi } from '@/lib/api'

export function ApiTest() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testSearch = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await propertyApi.search({ 
        location: 'New York', 
        guests: 2, 
        page: 1, 
        limit: 5 
      })
      setResults(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const testCategories = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await propertyApi.getCategories()
      setResults(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Categories failed')
    } finally {
      setLoading(false)
    }
  }

  const testHealthCheck = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await propertyApi.healthCheck()
      setResults(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Health check failed')
    } finally {
      setLoading(false)
    }
  }

  const testFilter = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await propertyApi.filter({ 
        location: 'California',
        min_price: 100,
        max_price: 500,
        property_types: ['apartment'],
        page: 1,
        limit: 5
      })
      setResults(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Filter failed')
    } finally {
      setLoading(false)
    }
  }

  const testLocationSuggestions = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await propertyApi.getLocationSuggestions('New', 5)
      setResults(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Location suggestions failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">API Test Panel</h3>
      
      <div className="space-x-2 mb-4">
        <button 
          onClick={testHealthCheck}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Health Check
        </button>
        <button 
          onClick={testSearch}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Search
        </button>
        <button 
          onClick={testCategories}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Categories
        </button>
        <button 
          onClick={testFilter}
          disabled={loading}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
        >
          Test Filter
        </button>
        <button 
          onClick={testLocationSuggestions}
          disabled={loading}
          className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:opacity-50"
        >
          Test Locations
        </button>
      </div>

      {loading && <p className="text-blue-600">Loading...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      
      {results && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Results:</h4>
          <pre className="bg-white p-4 rounded border text-xs overflow-auto max-h-96">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}