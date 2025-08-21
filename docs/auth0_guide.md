## Auth0 SPA Login Implementation Guide (in this project)

This repository implements Auth0 login using the SPA SDK and Universal Login. Tokens are obtained on the client and can be attached to API requests.

### Architecture Overview
- Library: `@auth0/auth0-react` (SPA SDK)
- Flow: PKCE, no client secret on frontend
- UI: Hosted Universal Login (redirect-based)
- Session: In-memory (SDK), optional localstorage not used here

### Key Files
```1:200:src/contexts/auth0-context.tsx
'use client'
import { Auth0Provider as Auth0SPAProvider, useAuth0 as useAuth0React } from '@auth0/auth0-react'
import { ReactNode, useMemo } from 'react'
import { useRouter } from 'next/navigation'

interface Auth0ProviderProps {
  children: ReactNode
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
      {children}
    </Auth0SPAProvider>
  )
}

export const useAuth0 = useAuth0React
```

### Environment
Set in `.env.local`:

```
NEXT_PUBLIC_AUTH0_DOMAIN=YOUR_TENANT_REGION.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=YOUR_CLIENT_ID
NEXT_PUBLIC_AUTH0_AUDIENCE=https://api.myapp.com
```

### Notes
- Server-side Auth0 middleware and routes were removed.
- Use `useAuth0()` from `@auth0/auth0-react` to login/logout and get tokens.
