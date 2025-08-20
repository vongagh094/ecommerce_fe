"use client"

import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function CallbackPage() {
  const { isLoading, error, isAuthenticated } = useAuth0()
  const router = useRouter()
  const { checkSession } = useAuth()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // If authentication is complete and successful, check our session
    // and redirect to the return URL or home page
    const handleAuthComplete = async () => {
      if (isRedirecting) return
      
      if (!isLoading && isAuthenticated) {
        setIsRedirecting(true)
        
        try {
          // Make sure our session is established
          await checkSession()
          
          // Get the return URL from localStorage if available
          // The actual redirect will be handled by Auth0Provider's onRedirectCallback
          // This is just a fallback in case that doesn't work
          const returnTo = localStorage.getItem('auth_return_url')
          if (returnTo) {
            localStorage.removeItem('auth_return_url')
            // Small delay to allow Auth0Provider to handle the redirect first
            setTimeout(() => {
              if (document.location.pathname === '/callback') {
                router.replace(returnTo)
              }
            }, 1000)
          }
        } catch (error) {
          console.error('Error during callback handling:', error)
          // Fallback to home page if there's an error
          setTimeout(() => {
            if (document.location.pathname === '/callback') {
              router.replace('/')
            }
          }, 1000)
        }
      }
    }
    
    handleAuthComplete()
  }, [isLoading, isAuthenticated, router, checkSession, isRedirecting])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4 text-red-600">Authentication Error</h1>
          <p className="text-gray-700 mb-4">{String(error)}</p>
          <button 
            onClick={() => router.replace('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Completing login...</h1>
        <p className="text-gray-700">Please wait while we redirect you.</p>
        <div className="mt-4 w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto"></div>
      </div>
    </div>
  )
} 