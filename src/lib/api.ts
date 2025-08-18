import { 
  SearchParams, 
  FilterParams, 
  SearchResponse, 
  PropertyDetails, 
  Category, 
  Amenity 
} from "@/types"
import { apiClient, buildQueryString, ApiError } from './api/base'

// Re-export for backward compatibility
export { ApiError }



// Backend response types (matching actual API)
interface BackendSearchResponse {
  properties: PropertyDetails[]
  pagination: {
    page: number
    limit: number
    total: number
    has_more: boolean
  }
  status_code: number
}

interface LocationSuggestion {
  display_name: string
  city: string
  state: string
  country: string
  property_count: number
}

// Transform backend response to frontend format
function transformBackendResponse(backendResponse: BackendSearchResponse): SearchResponse {
  return {
    properties: backendResponse.properties,
    pagination: {
      page: backendResponse.pagination.page,
      limit: backendResponse.pagination.limit,
      total: backendResponse.pagination.total,
      total_pages: Math.ceil(backendResponse.pagination.total / backendResponse.pagination.limit),
      has_next: backendResponse.pagination.has_more,
      has_prev: backendResponse.pagination.page > 1
    },
    filters: {
      available_categories: [],
      price_range: { min: 0, max: 1000 },
      available_amenities: [],
      location_suggestions: []
    },
    search_metadata: {
      query_time_ms: 0,
      total_found: backendResponse.pagination.total
    },
    // Backward compatibility
    total: backendResponse.pagination.total,
    page: backendResponse.pagination.page,
    limit: backendResponse.pagination.limit,
    has_more: backendResponse.pagination.has_more
  }
}

export const propertyApi = {
  // Search properties (public - no auth required)
  // GET /api/v1/properties/search
  search: async (params: SearchParams): Promise<SearchResponse> => {
    const queryString = buildQueryString(params)
    const response = await apiClient.get<BackendSearchResponse>(`/properties/search?${queryString}`)
    return transformBackendResponse(response)
  },

  // Filter properties with advanced criteria (public - no auth required)
  // GET /api/v1/properties/filter
  filter: async (params: FilterParams): Promise<SearchResponse> => {
    const queryString = buildQueryString(params)
    const response = await apiClient.get<BackendSearchResponse>(`/properties/filter?${queryString}`)
    return transformBackendResponse(response)
  },

  // Browse properties by category (public - no auth required)
  // GET /api/v1/properties/categories/{category_name}
  browseByCategory: async (categoryName: string, params?: Partial<SearchParams>): Promise<SearchResponse> => {
    const queryString = params ? buildQueryString(params) : ''
    const query = queryString ? `?${queryString}` : ''
    const response = await apiClient.get<BackendSearchResponse>(`/properties/categories/${categoryName}${query}`)
    return transformBackendResponse(response)
  },

  // Get property details (public - no auth required)
  // GET /api/v1/properties/{property_id}
  getDetails: async (propertyId: string): Promise<PropertyDetails> => {
    return await apiClient.get<PropertyDetails>(`/properties/${propertyId}`)
  },

  // Get categories list (public - no auth required)
  // GET /api/v1/properties/categories
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<{ categories: Category[] }>('/properties/categories')
    return response.categories
  },

  // Get amenities list (public - no auth required)
  // GET /api/v1/properties/amenities
  getAmenities: async (): Promise<Amenity[]> => {
    const response = await apiClient.get<{ amenities: Amenity[] }>('/properties/amenities')
    return response.amenities
  },

  // Get location suggestions (public - no auth required)
  // GET /api/v1/properties/locations/suggestions
  getLocationSuggestions: async (query: string, limit = 10) => {
    const queryString = buildQueryString({ query, limit })
    return await apiClient.get<{ suggestions: LocationSuggestion[] }>(`/properties/locations/suggestions?${queryString}`)
  },

  // Health check (public - no auth required)
  // GET /api/v1/health
  healthCheck: async () => {
    return await apiClient.get<{ status: string; version: string }>('/health')
  }
}


// Host-specific APIs (public - no auth required for profile viewing)
export const hostApi = {
  // Get host profile (public)
  getProfile: async (hostId: string) => {
    return apiClient.get(`/hosts/${hostId}/profile`)
  },

  // Get host statistics (public)
  getStatistics: async (hostId: string) => {
    return apiClient.get(`/hosts/${hostId}/statistics`)
  }
}

// Authenticated APIs (require login)
export const authApi = {
  // User profile
  getProfile: async () => {
    return apiClient.get('/user/profile', { requireAuth: true })
  },

  updateProfile: async (data: any) => {
    return apiClient.put('/user/profile', data, { requireAuth: true })
  },

  // Bookings
  createBooking: async (bookingData: any) => {
    return apiClient.post('/bookings', bookingData, { requireAuth: true })
  },

  getUserBookings: async () => {
    return apiClient.get('/user/bookings', { requireAuth: true })
  },

  cancelBooking: async (bookingId: string) => {
    return apiClient.delete(`/bookings/${bookingId}`, { requireAuth: true })
  },

  // Bidding
  placeBid: async (bidData: any) => {
    return apiClient.post('/bids', bidData, { requireAuth: true })
  },

  getUserBids: async () => {
    return apiClient.get('/user/bids', { requireAuth: true })
  },

  withdrawBid: async (bidId: string) => {
    return apiClient.delete(`/bids/${bidId}`, { requireAuth: true })
  },

  // Wishlist/Favorites
  getUserWishlists: async () => {
    return apiClient.get('/user/wishlists', { requireAuth: true })
  },

  createWishlist: async (wishlistData: any) => {
    return apiClient.post('/user/wishlists', wishlistData, { requireAuth: true })
  },

  addToWishlist: async (wishlistId: string, propertyId: string) => {
    return apiClient.post(`/user/wishlists/${wishlistId}/properties`, 
      { propertyId }, { requireAuth: true })
  },

  removeFromWishlist: async (wishlistId: string, propertyId: string) => {
    return apiClient.delete(`/user/wishlists/${wishlistId}/properties/${propertyId}`, 
      { requireAuth: true })
  },

  // Host APIs (authenticated)
  becomeHost: async (hostData: any) => {
    return apiClient.post('/host/register', hostData, { requireAuth: true })
  },

  createProperty: async (propertyData: any) => {
    return apiClient.post('/host/properties', propertyData, { requireAuth: true })
  },

  getHostProperties: async (params?: { page?: number; limit?: number }) => {
    const queryString = params ? buildQueryString(params) : ''
    const query = queryString ? `?${queryString}` : ''
    return apiClient.get(`/host/properties${query}`, { requireAuth: true })
  },

  updateProperty: async (propertyId: string, propertyData: any) => {
    return apiClient.put(`/host/properties/${propertyId}`, propertyData, { requireAuth: true })
  },

  createAuction: async (auctionData: any) => {
    return apiClient.post('/host/auctions', auctionData, { requireAuth: true })
  },

  getHostAuctions: async () => {
    return apiClient.get('/host/auctions', { requireAuth: true })
  },

  // Messages
  getConversations: async (params?: { page?: number; limit?: number }) => {
    const queryString = params ? buildQueryString(params) : ''
    const query = queryString ? `?${queryString}` : ''
    return apiClient.get(`/user/conversations${query}`, { requireAuth: true })
  },

  getMessages: async (conversationId: string, params?: { page?: number; limit?: number }) => {
    const queryString = params ? buildQueryString(params) : ''
    const query = queryString ? `?${queryString}` : ''
    return apiClient.get(`/conversations/${conversationId}/messages${query}`, { requireAuth: true })
  },

  sendMessage: async (conversationId: string, message: string) => {
    return apiClient.post(`/conversations/${conversationId}/messages`, 
      { message }, { requireAuth: true })
  }
}

// Re-export for backward compatibility
export { apiClient as apiWrapper }