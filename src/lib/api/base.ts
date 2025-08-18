/**
 * Base API client with authentication and error handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export class ApiError extends Error {
  constructor(
    public status: number, 
    message: string, 
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean
  skipAuthRefresh?: boolean
  getAccessTokenSilently?: (() => Promise<string>) | null
}

/**
 * Enhanced API wrapper with authentication and error handling
 */
async function fetchApi<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const { requireAuth = false, skipAuthRefresh = false, getAccessTokenSilently = null, ...fetchOptions } = options
  const url = `${API_BASE_URL}${endpoint}`
  
  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  }

  // Add authentication token if required or available (client-side only)
  const tokenGetter = getAccessTokenSilently || (typeof window !== 'undefined' ? (window as any).__getAccessTokenSilently : null)
  if ((requireAuth || !skipAuthRefresh) && typeof window !== 'undefined' && tokenGetter) {
    try {
      const token = await tokenGetter()
      console.log('token', token)
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
      throw new ApiError(401, 'Authentication failed', 'AUTH_FAILED')
    }

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      let errorCode = `HTTP_${response.status}`
      let errorDetails = undefined
      
      try {
        const errorData = await response.json()
        errorMessage = errorData.error?.message || errorData.message || errorMessage
        errorCode = errorData.error?.code || errorData.code || errorCode
        errorDetails = errorData.error?.details || errorData.details
      } catch {
        // If response is not JSON, use default message
      }
      
      throw new ApiError(response.status, errorMessage, errorCode, errorDetails)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(500, 'Network error occurred', 'NETWORK_ERROR')
  }
}

/**
 * HTTP method helpers
 */
export const apiClient = {
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

/**
 * Build query string from parameters
 */
export function buildQueryString(params: Record<string, any>): string {
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

  return searchParams.toString()
}