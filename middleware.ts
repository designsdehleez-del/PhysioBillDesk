import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected route segments
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/billing',
  '/patients',
  '/feedback-builder',
  '/doctors',
  '/centres',
  '/staff',
  '/services',
  '/discounts',
  '/settings',
]

const ADMIN_ONLY_PREFIXES = [
  '/staff',
  '/centres',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignore static assets, next internal files, and public images
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/icons') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/logo.png' ||
    pathname === '/' ||
    pathname.startsWith('/feedback') // Patient feedback public submission
  ) {
    return NextResponse.next()
  }

  // Check if target is a protected route
  const isProtected = PROTECTED_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/'))

  if (!isProtected) {
    return NextResponse.next()
  }

  // Inspect session cookies
  const sessionToken = request.cookies.get('physio_session_token')?.value
  const userRole = request.cookies.get('physio_user_role')?.value
  const supabaseToken = request.cookies.get('sb-access-token')?.value || request.cookies.get('sb-auth-token')?.value

  const hasSession = Boolean(sessionToken || supabaseToken)

  // In demo/hybrid mode: if client cookie is present, allow or check role
  if (!hasSession) {
    // If not authenticated, redirect to login with callback URL
    const loginUrl = new URL('/', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Admin-only route protection
  const isAdminOnly = ADMIN_ONLY_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/'))
  if (isAdminOnly && userRole && userRole !== 'admin') {
    const dashboardUrl = new URL('/dashboard', request.url)
    dashboardUrl.searchParams.set('error', 'unauthorized_admin_area')
    return NextResponse.redirect(dashboardUrl)
  }

  // Doctor-restricted routes — block access to financial admin areas
  const DOCTOR_BLOCKED_PREFIXES = ['/staff', '/centres', '/services', '/discounts', '/billing', '/settings/data']
  if (userRole === 'doctor') {
    const isBlocked = DOCTOR_BLOCKED_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/'))
    if (isBlocked) {
      const dashboardUrl = new URL('/dashboard', request.url)
      dashboardUrl.searchParams.set('error', 'doctor_restricted')
      return NextResponse.redirect(dashboardUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/).*)',
  ],
}
