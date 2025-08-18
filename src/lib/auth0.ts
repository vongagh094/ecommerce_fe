import { 
  initAuth0,
  getSession as getAuth0Session,
  getAccessToken as getAuth0AccessToken
} from '@auth0/nextjs-auth0'

// Initialize Auth0 with environment variables
export const auth0 = initAuth0()

// Re-export session and token functions
export async function getSession() {
  return getAuth0Session()
}

export async function getAccessToken() {
  return getAuth0AccessToken()
}