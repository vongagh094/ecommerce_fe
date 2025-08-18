'use client'
import { Auth0Provider as Auth0SPAProvider, useAuth0 as useAuth0React } from '@auth0/auth0-react'
import { ReactNode, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { userApi } from '@/lib/api/user'

interface Auth0ProviderProps {
  children: ReactNode
}

function Auth0TokenBridge() {
  const { getAccessTokenSilently } = useAuth0React()
  useEffect(() => {
    ;(window as any).__getAccessTokenSilently = getAccessTokenSilently
    return () => {
      if ((window as any).__getAccessTokenSilently === getAccessTokenSilently) {
        delete (window as any).__getAccessTokenSilently
      }
    }
  }, [getAccessTokenSilently])
  return null
}

function Auth0SyncUser() {
  const { isAuthenticated, user } = useAuth0React()
  const syncedRef = useRef(false)

  useEffect(() => {
    const doSync = async () => {
      if (!isAuthenticated || !user || syncedRef.current) return
      try {
        const auth0UserId = (user as any).sub as string
        const email = (user as any).email as string
        const emailVerified = Boolean((user as any).email_verified)
        const name = (user as any).name as string | undefined
        const picture = (user as any).picture as string | undefined
        if (auth0UserId && email) {
          await userApi.syncAuth0User({ auth0UserId, email, emailVerified, name, picture })
        }
      } catch (err) {
        console.warn('User sync failed (non-fatal):', err)
      } finally {
        syncedRef.current = true
      }
    }
    doSync()
  }, [isAuthenticated, user])

  return null
}

export function Auth0Provider({ children }: Auth0ProviderProps) {
  const router = useRouter()

  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN as string
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID as string
  const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE as string | undefined

  const redirectUri = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    return `${window.location.origin}/callback`
  }, [])

  return (
    <Auth0SPAProvider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience,
        scope: 'openid profile email',
      }}
      onRedirectCallback={(appState) => {
        router.replace((appState as any)?.returnTo || '/')
      }}
      useRefreshTokens
      cacheLocation="memory"
    >
      <Auth0TokenBridge />
      <Auth0SyncUser />
      {children}
    </Auth0SPAProvider>
  )
}

// Re-export hook so existing imports continue to work
export const useAuth0 = useAuth0React