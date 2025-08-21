import { apiClient } from './base'

interface Auth0SyncRequestBody {
  auth0UserId: string
  email: string
  emailVerified: boolean
  name?: string
  picture?: string
}

interface Auth0SyncResponseBody {
  id: string
  auth0UserId: string
  email: string
  name?: string
  picture?: string
  createdAt: string
}

export const userApi = {
  // Upsert user in backend after Auth0 login
  syncAuth0User: async (payload: Auth0SyncRequestBody): Promise<Auth0SyncResponseBody> => {
    return apiClient.post('/users/auth0-sync', payload, { requireAuth: true })
  },

  // Update user profile in backend (app-specific fields)
  updateProfile: async (payload: {
    name?: string
    phone_number?: string
    gender?: 'male' | 'female' | 'other'
    picture?: string
  }): Promise<{ success: boolean }> => {
    return apiClient.put('/users/me', payload, { requireAuth: true })
  },

  getUserProfile: async (): Promise<{
    id: string
    auth0Id: string
    email: string
    name: string | null
    picture: string | null
    phone_number: string | null
    gender: string | null
    host_about: string | null
    host_review_count: number | null
    host_rating_average: number | null
    is_super_host: boolean | null
  }> => {
    return apiClient.get('/users/me/profile', { requireAuth: true })
  },
} 