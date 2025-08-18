"use client"

import { useAuth0 } from '@auth0/auth0-react'

export function AuthTest() {
	const { user, isAuthenticated, isLoading, loginWithRedirect, logout, getAccessTokenSilently } = useAuth0()

	return (
		<div>
			<p>Loading: {String(isLoading)}</p>
			<p>Authenticated: {String(isAuthenticated)}</p>
			<pre>{JSON.stringify(user, null, 2)}</pre>
			<button onClick={() => loginWithRedirect({ appState: { returnTo: '/' } })}>Login</button>
			<button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>Logout</button>
			<button onClick={async () => {
				const token = await getAccessTokenSilently()
				console.log('token', token)
			}}>Get Token</button>
		</div>
	)
}