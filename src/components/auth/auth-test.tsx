"use client"

import { useAuth0 } from '@/contexts/auth0-context'
import { Button } from '@/components/ui/button'

export function AuthTest() {
  const { user, isAuthenticated, isLoading, login, loginWithGoogle, logout, getToken } = useAuth0()

  const testToken = async () => {
    const token = await getToken()
    console.log('Access Token:', token)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Auth0 Test Component</h3>
      
      {!isAuthenticated ? (
        <div className="space-x-4">
          <Button onClick={() => login()}>
            Login with Email
          </Button>
          <Button onClick={() => loginWithGoogle()}>
            Login with Google
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p><strong>User:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
          </div>
          <div className="space-x-4">
            <Button onClick={testToken}>
              Test Get Token
            </Button>
            <Button onClick={() => logout()} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}