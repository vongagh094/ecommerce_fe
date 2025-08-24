import { NextRequest, NextResponse } from 'next/server';

// Define supported locales
const locales = ['en', 'vi'] as const;

export default function middleware(request: NextRequest) {
  // Check for locale in URL query parameter first (for language switching)
  const url = new URL(request.url);
  const urlLocale = url.searchParams.get('locale');
  
  // Then check cookie, or default to Vietnamese
  const cookieLocale = request.cookies.get('preferred-locale')?.value;
  const preferredLocale = urlLocale || cookieLocale || 'vi';
  
  // Validate the locale
  const locale = locales.includes(preferredLocale as any) ? preferredLocale : 'vi';
  
  // Log for debugging
  console.log('Middleware - URL:', request.url);
  console.log('Middleware - URL locale param:', urlLocale);
  console.log('Middleware - Cookie locale:', cookieLocale);
  console.log('Middleware - Final locale:', locale);
  
  // Add the locale to the request headers so we can access it in our app
  const response = NextResponse.next();
  response.headers.set('x-locale', locale);
  
  // Add cache control headers to prevent caching issues
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
}

export const config = {
  // Match all paths except static files and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};