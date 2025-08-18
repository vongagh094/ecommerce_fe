import { NextRequest, NextResponse } from "next/server"
import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge'

export default withMiddlewareAuthRequired()

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth/* (Auth0 routes)
     * 2. /_next/static (static files)
     * 3. /_next/image (image optimization files)
     * 4. /favicon.ico (favicon file)
     * 5. Public routes like / (home page)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|$).*)',
  ],
}
