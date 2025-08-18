import { getAccessToken } from '@auth0/nextjs-auth0'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { accessToken } = await getAccessToken()
    return NextResponse.json({ accessToken })
  } catch (error) {
    return NextResponse.json({ error: 'Unable to get access token' }, { status: 401 })
  }
}
