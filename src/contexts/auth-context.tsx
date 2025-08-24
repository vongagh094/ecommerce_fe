"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role?: 'user' | 'host' | 'admin'
}

interface AuthContextType {
  isLoggedIn: boolean
  user: User | null
  isAdmin: boolean
  login: (userData: User, accessToken?: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<boolean>
  loginAsAdmin: (email: string, password: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function decodeUserCookie(b64: string): User | null {
  try {
    const json = typeof window !== 'undefined' ? window.atob(b64) : ''
    const parsed = JSON.parse(json)
    if (parsed && parsed.id) return parsed as User
    return null
  } catch {
    return null
  }
}

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift()
  return undefined
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Check if we have a valid session
  const checkSession = async (): Promise<boolean> => {
    try {
      // First check for auth_user cookie
      const userCookie = getCookie('auth_user')
      if (userCookie) {
        const userData = decodeUserCookie(userCookie)
        if (userData) {
          setIsLoggedIn(true)
          setUser(userData)
          setIsAdmin(userData.role === 'admin')
          return true
        }
      }
      
      // If no cookie, check localStorage as fallback
      const savedAuthState = localStorage.getItem("sky-high-auth")
      if (savedAuthState) {
        try {
          const { isLoggedIn: savedIsLoggedIn, user: savedUser, isAdmin: savedIsAdmin } = JSON.parse(savedAuthState)
          if (savedUser && savedUser.id) {
            setIsLoggedIn(savedIsLoggedIn)
            setUser(savedUser)
            setIsAdmin(savedIsAdmin || savedUser.role === 'admin')
            return true
          }
        } catch {
          localStorage.removeItem("sky-high-auth")
        }
      }
      
      return false
    } catch (error) {
      console.error("Error checking session:", error)
      return false
    }
  }

  // Load auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      await checkSession()
      setIsInitialized(true)
    }
    
    initAuth()
  }, [])

  // Save auth state to localStorage whenever it changes (secondary persistence)
  useEffect(() => {
    if (isInitialized) {
      const authState = { isLoggedIn, user, isAdmin }
      localStorage.setItem("sky-high-auth", JSON.stringify(authState))
    }
  }, [isLoggedIn, user, isAdmin, isInitialized])

  const login = async (userData: User, accessToken?: string) => {
    setIsLoggedIn(true)
    setUser(userData)
    setIsAdmin(userData.role === 'admin')
    try {
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, user: userData })
      })
    } catch (error) {
      console.error("Error saving session:", error)
    }
  }

  const logout = async () => {
    setIsLoggedIn(false)
    setUser(null)
    setIsAdmin(false)
    localStorage.removeItem("sky-high-auth")
    try {
      await fetch('/api/auth/session', { method: 'DELETE' })
    } catch (error) {
      console.error("Error deleting session:", error)
    }
  }

  // Admin login function
  const loginAsAdmin = async (email: string, password: string): Promise<boolean> => {
    // Simple admin credentials check (in production, this should be server-side)
    if (email === 'admin@skyhigh.com' && password === 'admin123') {
      const adminUser: User = {
        id: 'admin-1',
        name: 'Admin User',
        email: email,
        role: 'admin'
      }
      
      await login(adminUser)
      return true
    }
    return false
  }

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      user,
      isAdmin,
      login,
      logout,
      checkSession,
      loginAsAdmin
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// Add error handling to make the hook more robust
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // Return default values instead of throwing error for better UX
    return {
      isLoggedIn: false,
      user: null,
      isAdmin: false,
      login: async () => {},
      logout: async () => {},
      checkSession: async () => false,
      loginAsAdmin: async () => false,
    }
  }
  return context
}
