"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@auth0/auth0-spa-js'
import {
  initAuth0,
  getCurrentUser,
  isAuthenticated as checkAuth,
  getAccessToken,
  login as auth0Login,
  loginWithGoogle as auth0LoginWithGoogle,
  logout as auth0Logout,
  refreshToken
} from '@/lib/auth0'

interface Auth0ContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (options?: { returnTo?: string }) => Promise<void>
  loginWithGoogle: (options?: { returnTo?: string }) => Promise<void>
  logout: (options?: { returnTo?: string }) => Promise<void>
  getToken: () => Promise<string | null>
  refreshUserToken: () => Promise<string | null>
}

const Auth0Context = createContext<Auth0ContextType | undefined>(undefined)

interface Auth0ProviderProps {
  children: ReactNode
}

export function Auth0Provider({ children }: Auth0ProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize Auth0 and check authentication status
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Initialize Auth0 client
        await initAuth0()

        // Check if user is authenticated
        const authenticated = await checkAuth()
        setIsAuthenticated(authenticated)

        if (authenticated) {
          // Get user information
          const userData = await getCurrentUser()
          setUser(userData ? userData : null)

          // Ensure we have a valid token
          await getAccessToken()
        }
      } catch (err) {
        console.error('Auth0 initialization error:', err)
        setError(err instanceof Error ? err.message : 'Authentication initialization failed')
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Set up token refresh interval
  useEffect(() => {
    if (isAuthenticated) {
      // Check token every 5 minutes and refresh if needed
      const interval = setInterval(async () => {
        try {
          await getAccessToken() // This will refresh if needed
        } catch (err) {
          console.error('Token refresh failed:', err)
        }
      }, 5 * 60 * 1000) // 5 minutes

      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const login = async (options?: { returnTo?: string }) => {
    try {
      setError(null)
      await auth0Login(options)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      throw err
    }
  }

  const loginWithGoogle = async (options?: { returnTo?: string }) => {
    try {
      setError(null)
      await auth0LoginWithGoogle(options)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed')
      throw err
    }
  }

  const logout = async (options?: { returnTo?: string }) => {
    try {
      setError(null)
      await auth0Logout(options)
      setUser(null)
      setIsAuthenticated(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed')
      throw err
    }
  }

  const getToken = async (): Promise<string | null> => {
    try {
      return await getAccessToken()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get token')
      return null
    }
  }

  const refreshUserToken = async (): Promise<string | null> => {
    try {
      return await refreshToken()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh token')
      return null
    }
  }

  const value: Auth0ContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    loginWithGoogle,
    logout,
    getToken,
    refreshUserToken
  }

  return (
    <Auth0Context.Provider value={value}>
      {children}
    </Auth0Context.Provider>
  )
}

export function useAuth0() {
  const context = useContext(Auth0Context)
  if (context === undefined) {
    throw new Error('useAuth0 must be used within an Auth0Provider')
  }
  return context
}