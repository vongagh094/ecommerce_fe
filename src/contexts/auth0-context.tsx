'use client'
import { Auth0Provider as Auth0SPAProvider, useAuth0 as useAuth0React } from '@auth0/auth0-react'
import { ReactNode, useMemo, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { userApi } from '@/lib/api/user'
import { useAuth } from './auth-context'

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
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0React()
  const { login } = useAuth()
  const syncedRef = useRef(false)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    const doSync = async () => {
      if (!isAuthenticated || !user || syncedRef.current || isSyncing) return
      
      try {
        setIsSyncing(true)
        const auth0UserId = (user as any).sub as string
        const email = (user as any).email as string
        const emailVerified = Boolean((user as any).email_verified)
        const name = (user as any).name as string | undefined
        const picture = (user as any).picture as string | undefined
        
        const accessToken = await getAccessTokenSilently()

        let appUser = null as null | { id: string, name?: string | null, picture?: string | null }
        try {
          // Best effort backend sync
          appUser = await userApi.syncAuth0User({ auth0UserId, email, emailVerified, name, picture })
        } catch (err) {
          console.warn('User sync failed (non-fatal):', err)
        }

        // Always set our app session so cookies/UI state are present
        await login({
          id: appUser?.id || auth0UserId,
          name: (appUser?.name || name || email.split('@')[0]) as string,
          email,
          avatar: (appUser?.picture || picture) as string | undefined,
        }, accessToken)

        syncedRef.current = true
      } catch (err) {
        console.warn('Auth0 bridge failed:', err)
      } finally {
        setIsSyncing(false)
      }
    }
    
    doSync()
  }, [isAuthenticated, user, getAccessTokenSilently, login, isSyncing])

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

  const handleRedirectCallback = (appState: any) => {
    const savedReturnUrl = typeof window !== 'undefined' ? localStorage.getItem('auth_return_url') : null
    const redirectTo = savedReturnUrl || (appState?.returnTo || '/')
    if (savedReturnUrl && typeof window !== 'undefined') {
      localStorage.removeItem('auth_return_url')
    }
    router.replace(redirectTo)
  }

  return (
    <Auth0SPAProvider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience,
        scope: 'openid profile email offline_access',
      }}
      onRedirectCallback={handleRedirectCallback}
      useRefreshTokens
      cacheLocation="localstorage"
    >
      <Auth0TokenBridge />
      <Auth0SyncUser />
      {children}
    </Auth0SPAProvider>
  )
}

export const useAuth0 = useAuth0React