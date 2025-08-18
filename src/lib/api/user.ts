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
} 