'use client'
import { UserProvider, useUser } from '@auth0/nextjs-auth0/client'
import { ReactNode } from 'react'

interface Auth0ProviderProps {
  children: ReactNode
}

export function Auth0Provider({ children }: Auth0ProviderProps) {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  )
}

// Compatibility wrapper for existing code
export function useAuth0() {
  const { user, isLoading, error } = useUser()
  
  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error: error?.message || null,
    login: () => {
      window.location.assign('/api/auth/login')
    },
    loginWithGoogle: () => {
      window.location.assign('/api/auth/login?connection=google-oauth2')
    },
    logout: () => {
      window.location.assign('/api/auth/logout')
    },
    getToken: async () => {
      // For client-side token access, you'd need to fetch from /api/auth/token
      // This is a simplified implementation
      try {
        const response = await fetch('/api/auth/token')
        const data = await response.json()
        return data.accessToken
      } catch {
        return null
      }
    },
    refreshUserToken: async () => {
      // Token refresh is handled automatically by the SDK
      return null
    }
  }
}