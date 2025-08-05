import { 
  SearchParams, 
  FilterParams, 
  SearchResponse, 
  PropertyDetails, 
  Category, 
  Amenity 
} from "@/types"
import { getAccessToken } from './auth0'
import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message)
    this.name = 'ApiError'
  }
}

interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean
  skipAuthRefresh?: boolean
}

// Enhanced API wrapper with authentication
async function fetchApi<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const { requireAuth = false, skipAuthRefresh = false, ...fetchOptions } = options
  const url = `${API_BASE_URL}${endpoint}`
  
  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
    Authorization: '',
  }

  // Add authentication token if required or available
  if (requireAuth || (!skipAuthRefresh && typeof window !== 'undefined')) {
    try {
      const token = await getAccessToken()
      if (token) {
        headers.Authorization = `Bearer ${token}`
      } else if (requireAuth) {
        throw new ApiError(401, 'Authentication required', 'AUTH_REQUIRED')
      }
    } catch (error) {
      if (requireAuth) {
        throw new ApiError(401, 'Failed to get authentication token', 'AUTH_TOKEN_ERROR')
      }
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    })

    // Handle authentication errors
    if (response.status === 401) {
      if (!skipAuthRefresh && typeof window !== 'undefined') {
        // Try to refresh token once
        try {
          const { refreshToken } = await import('./auth0')
          const newToken = await refreshToken()
          if (newToken) {
            // Retry request with new token
            headers.Authorization = `Bearer ${newToken}`
            const retryResponse = await fetch(url, {
              ...fetchOptions,
              headers,
            })
            
            if (retryResponse.ok) {
              return await retryResponse.json()
            }
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
        }
      }
      
      throw new ApiError(401, 'Authentication failed', 'AUTH_FAILED')
    }

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      let errorCode = `HTTP_${response.status}`
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
        errorCode = errorData.code || errorCode
      } catch {
        // If response is not JSON, use default message
      }
      
      throw new ApiError(response.status, errorMessage, errorCode)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(500, 'Network error occurred', 'NETWORK_ERROR')
  }
}

// Convenience methods for different HTTP methods
const apiWrapper = {
  get: <T>(endpoint: string, options?: ApiRequestOptions) => 
    fetchApi<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T>(endpoint: string, data?: any, options?: ApiRequestOptions) => 
    fetchApi<T>(endpoint, { 
      ...options, 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined 
    }),
    
  put: <T>(endpoint: string, data?: any, options?: ApiRequestOptions) => 
    fetchApi<T>(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined 
    }),
    
  patch: <T>(endpoint: string, data?: any, options?: ApiRequestOptions) => 
    fetchApi<T>(endpoint, { 
      ...options, 
      method: 'PATCH', 
      body: data ? JSON.stringify(data) : undefined 
    }),
    
  delete: <T>(endpoint: string, options?: ApiRequestOptions) => 
    fetchApi<T>(endpoint, { ...options, method: 'DELETE' }),
}

export const propertyApi = {
  // Search properties (public - no auth required)
  search: async (params: SearchParams): Promise<SearchResponse> => {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    return apiWrapper.get<SearchResponse>(`/properties/search?${searchParams}`)
  },

  // Filter properties with advanced criteria (public - no auth required)
  filter: async (params: FilterParams): Promise<SearchResponse> => {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item.toString()))
        } else {
          searchParams.append(key, value.toString())
        }
      }
    })

    return apiWrapper.get<SearchResponse>(`/properties/filter?${searchParams}`)
  },

  // Browse properties by category (public - no auth required)
  browseByCategory: async (categoryName: string, params?: Partial<SearchParams>): Promise<SearchResponse> => {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const query = searchParams.toString() ? `?${searchParams}` : ''
    return apiWrapper.get<SearchResponse>(`/properties/categories/${categoryName}${query}`)
  },

  // Get property details (public - no auth required)
  getDetails: async (propertyId: string): Promise<PropertyDetails> => {
    return apiWrapper.get<PropertyDetails>(`/properties/${propertyId}`)
  },

  // Get categories list (public - no auth required)
  getCategories: async (): Promise<Category[]> => {
    const response = await apiWrapper.get<{ categories: Category[] }>('/properties/categories')
    return response.categories
  },

  // Get amenities list (public - no auth required)
  getAmenities: async (): Promise<Amenity[]> => {
    const response = await apiWrapper.get<{ amenities: Amenity[] }>('/amenities')
    return response.amenities
  },

  // Get location suggestions (public - no auth required)
  getLocationSuggestions: async (query: string, limit = 10) => {
    const searchParams = new URLSearchParams({ query, limit: limit.toString() })
    const response = await apiWrapper.get<{ suggestions: any[] }>(`/locations/suggestions?${searchParams}`)
    return response.suggestions
  }
}

// Authenticated APIs (require login)
export const authApi = {
  // User profile
  getProfile: async () => {
    return apiWrapper.get('/user/profile', { requireAuth: true })
  },

  updateProfile: async (data: any) => {
    return apiWrapper.put('/user/profile', data, { requireAuth: true })
  },

  // Bookings
  createBooking: async (bookingData: any) => {
    return apiWrapper.post('/bookings', bookingData, { requireAuth: true })
  },

  getUserBookings: async () => {
    return apiWrapper.get('/user/bookings', { requireAuth: true })
  },

  cancelBooking: async (bookingId: string) => {
    return apiWrapper.delete(`/bookings/${bookingId}`, { requireAuth: true })
  },

  // Bidding
  placeBid: async (bidData: any) => {
    return apiWrapper.post('/bids', bidData, { requireAuth: true })
  },

  getUserBids: async () => {
    return apiWrapper.get('/user/bids', { requireAuth: true })
  },

  withdrawBid: async (bidId: string) => {
    return apiWrapper.delete(`/bids/${bidId}`, { requireAuth: true })
  },

  // Wishlist
  getUserWishlists: async () => {
    return apiWrapper.get('/user/wishlists', { requireAuth: true })
  },

  createWishlist: async (wishlistData: any) => {
    return apiWrapper.post('/user/wishlists', wishlistData, { requireAuth: true })
  },

  addToWishlist: async (wishlistId: string, propertyId: string) => {
    return apiWrapper.post(`/user/wishlists/${wishlistId}/properties`, 
      { propertyId }, { requireAuth: true })
  },

  removeFromWishlist: async (wishlistId: string, propertyId: string) => {
    return apiWrapper.delete(`/user/wishlists/${wishlistId}/properties/${propertyId}`, 
      { requireAuth: true })
  },

  // Host APIs
  becomeHost: async (hostData: any) => {
    return apiWrapper.post('/host/register', hostData, { requireAuth: true })
  },

  createProperty: async (propertyData: any) => {
    return apiWrapper.post('/host/properties', propertyData, { requireAuth: true })
  },

  getHostProperties: async () => {
    return apiWrapper.get('/host/properties', { requireAuth: true })
  },

  updateProperty: async (propertyId: string, propertyData: any) => {
    return apiWrapper.put(`/host/properties/${propertyId}`, propertyData, { requireAuth: true })
  },

  createAuction: async (auctionData: any) => {
    return apiWrapper.post('/host/auctions', auctionData, { requireAuth: true })
  },

  getHostAuctions: async () => {
    return apiWrapper.get('/host/auctions', { requireAuth: true })
  },

  // Messages
  getConversations: async () => {
    return apiWrapper.get('/user/conversations', { requireAuth: true })
  },

  getMessages: async (conversationId: string) => {
    return apiWrapper.get(`/conversations/${conversationId}/messages`, { requireAuth: true })
  },

  sendMessage: async (conversationId: string, message: string) => {
    return apiWrapper.post(`/conversations/${conversationId}/messages`, 
      { message }, { requireAuth: true })
  }
}

export { ApiError, apiWrapper }