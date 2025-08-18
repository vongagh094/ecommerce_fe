"use client"

import { useAuth0 } from '@auth0/auth0-react'

export default function CallbackPage() {
  const { isLoading, error } = useAuth0()

  if (error) return <p>Auth error: {String(error)}</p>
  if (isLoading) return <p>Completing login…</p>

  return <p>Completing login…</p>
} 