import { createAuth0Client, Auth0Client } from '@auth0/auth0-spa-js'
import Cookies from 'js-cookie'

// Auth0 configuration
const auth0Config = {
  domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN!,
  clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!,
  authorizationParams: {
    redirect_uri: typeof window !== 'undefined' ? window.location.origin + '/callback' : '',
    audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
    scope: 'openid profile email offline_access'
  },
  cacheLocation: 'localstorage' as const,
  useRefreshTokens: true,
  useRefreshTokensFallback: true
}

let auth0Client: Auth0Client | null = null

// Initialize Auth0 client
export const initAuth0 = async (): Promise<Auth0Client> => {
  if (!auth0Client) {
    auth0Client = await createAuth0Client(auth0Config)
  }
  // The client has been initialized (or already existed) — assert non-null for the type system
  return auth0Client as Auth0Client
}

// Get Auth0 client instance
export const getAuth0Client = (): Auth0Client | null => {
  return auth0Client
}

interface LoginOptions {
  /**
   * Where to send the user back once Auth0 redirects back to our app.
   * Defaults to the current page (with pathname only) or the redirect_uri from config.
   */
  returnTo?: string
  /**
   * Hint for Auth0 to open the signup tab instead of login.
   * See https://auth0.com/docs/api/authentication#authorize-client for details
   */
  screenHint?: 'signup' | 'login'
}

export const login = async (options?: LoginOptions) => {
  const client = await initAuth0()

  await client.loginWithRedirect({
    authorizationParams: {
      ...auth0Config.authorizationParams,
      redirect_uri: options?.returnTo || auth0Config.authorizationParams.redirect_uri,
      // Only include screen_hint if provided to avoid overriding Auth0 defaults
      ...(options?.screenHint ? { screen_hint: options.screenHint } : {})
    }
  })
}

// Login with Google social connection
export const loginWithGoogle = async (options?: LoginOptions) => {
  const client = await initAuth0()

  await client.loginWithRedirect({
    authorizationParams: {
      ...auth0Config.authorizationParams,
      connection: 'google-oauth2',
      redirect_uri: options?.returnTo || auth0Config.authorizationParams.redirect_uri,
      ...(options?.screenHint ? { screen_hint: options.screenHint } : {})
    }
  })
}

// Logout
export const logout = async (options?: { returnTo?: string }) => {
  const client = await initAuth0()
  
  // Clear cookies
  Cookies.remove('access_token', { path: '/', secure: true, sameSite: 'strict' })
  Cookies.remove('refresh_token', { path: '/', secure: true, sameSite: 'strict' })
  
  await client.logout({
    logoutParams: {
      returnTo: options?.returnTo || window.location.origin
    }
  })
}

// Handle callback after login
export const handleCallback = async (): Promise<void> => {
  const client = await initAuth0()
  await client.handleRedirectCallback()
  
  // Get tokens and store in httpOnly cookies
  const accessToken = await client.getTokenSilently()
  const user = await client.getUser()
  
  // Store tokens in httpOnly cookies (this would typically be done by your backend)
  // For now, we'll store in regular cookies with secure flags
  Cookies.set('access_token', accessToken, {
    expires: 7, // 7 days
    secure: true,
    sameSite: 'strict',
    path: '/'
  })
  
  // Note: Refresh token is handled internally by Auth0 SDK
  // In production, you'd want to store this server-side
}

// Get access token silently
export const getAccessToken = async (): Promise<string | null> => {
  try {
    // First try to get from cookie
    const cookieToken = Cookies.get('access_token')
    if (cookieToken) {
      // Verify token is not expired (basic check)
      const tokenPayload = JSON.parse(atob(cookieToken.split('.')[1]))
      const currentTime = Date.now() / 1000
      
      if (tokenPayload.exp > currentTime) {
        return cookieToken
      }
    }
    
    // If cookie token is expired or doesn't exist, get fresh token
    const client = await initAuth0()
    const token = await client.getTokenSilently()
    
    // Update cookie with fresh token
    Cookies.set('access_token', token, {
      expires: 7,
      secure: true,
      sameSite: 'strict',
      path: '/'
    })
    
    return token
  } catch (error) {
    console.error('Failed to get access token:', error)
    return null
  }
}

// Get current user
export const getCurrentUser = async () => {
  try {
    const client = await initAuth0()
    const isAuthenticated = await client.isAuthenticated()
    
    if (isAuthenticated) {
      return await client.getUser()
    }
    
    return null
  } catch (error) {
    console.error('Failed to get current user:', error)
    return null
  }
}

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const client = await initAuth0()
    return await client.isAuthenticated()
  } catch (error) {
    console.error('Failed to check authentication:', error)
    return false
  }
}

// Refresh token silently
export const refreshToken = async (): Promise<string | null> => {
  try {
    const client = await initAuth0()
    const token = await client.getTokenSilently({ 
      cacheMode: 'off' // Force refresh
    })
    
    // Update cookie
    Cookies.set('access_token', token, {
      expires: 7,
      secure: true,
      sameSite: 'strict',
      path: '/'
    })
    
    return token
  } catch (error) {
    console.error('Failed to refresh token:', error)
    return null
  }
}