"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { handleCallback } from '@/lib/auth0'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuth0 } from '@/contexts/auth0-context'
import { userApi } from '@/lib/api/user'

export default function CallbackPage() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useAuth0()

  useEffect(() => {
    const processCallback = async () => {
      try {
        await handleCallback()

        // Try to sync user (best-effort; ignore errors)
        try {
          // We may not have user immediately; small delay to let SDK populate
          await new Promise(r => setTimeout(r, 300))
          const freshUser = user || (await (async () => null)())
          if (freshUser) {
            const auth0UserId = (freshUser as any).sub as string
            const email = (freshUser as any).email as string
            const emailVerified = Boolean((freshUser as any).email_verified)
            const name = (freshUser as any).name as string | undefined
            const picture = (freshUser as any).picture as string | undefined
            if (auth0UserId && email) {
              await userApi.syncAuth0User({ auth0UserId, email, emailVerified, name, picture })
            }
          }
        } catch (syncErr) {
          // non-fatal
          console.warn('User sync failed (non-fatal):', syncErr)
        }
        
        // Get the return URL from query params or default to home
        const urlParams = new URLSearchParams(window.location.search)
        const returnTo = urlParams.get('returnTo') || '/'
        
        // Redirect to the intended page
        router.replace(returnTo)
      } catch (err) {
        console.error('Callback processing failed:', err)
        setError(err instanceof Error ? err.message : 'Authentication failed')
      }
    }

    processCallback()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
} 