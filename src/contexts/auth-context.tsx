"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthContextType {
  isLoggedIn: boolean
  user: User | null
  login: (userData: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  // Load auth state from localStorage on mount
  useEffect(() => {
    const savedAuthState = localStorage.getItem("sky-high-auth")
    if (savedAuthState) {
      try {
        const { isLoggedIn: savedIsLoggedIn, user: savedUser } = JSON.parse(savedAuthState)
        setIsLoggedIn(savedIsLoggedIn)
        setUser(savedUser)
      } catch (error) {
        console.error("Error loading auth state:", error)
        localStorage.removeItem("sky-high-auth")
      }
    }
  }, [])

  // Save auth state to localStorage whenever it changes
  useEffect(() => {
    const authState = { isLoggedIn, user }
    localStorage.setItem("sky-high-auth", JSON.stringify(authState))
  }, [isLoggedIn, user])

  const login = (userData: User) => {
    setIsLoggedIn(true)
    setUser(userData)
  }

  const logout = () => {
    setIsLoggedIn(false)
    setUser(null)
    localStorage.removeItem("sky-high-auth")
  }

  return <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>{children}</AuthContext.Provider>
}

// Add error handling to make the hook more robust
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // Return default values instead of throwing error for better UX
    return {
      isLoggedIn: false,
      user: null,
      login: () => {},
      logout: () => {},
    }
  }
  return context
}
