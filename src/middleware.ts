import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname
  
  // Skip static assets for performance
  if (path.includes('.') && !path.endsWith('.html')) {
    return NextResponse.next()
  }
  
  // Check if the request is for the monitoring dashboard
  if (path.startsWith('/admin/monitoring')) {
    // In production, you'd want to implement proper authentication
    // For now, we'll just check for a secret query parameter
    const secret = request.nextUrl.searchParams.get('secret')
    
    if (secret !== process.env.MONITORING_SECRET) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
  }
  
  // Process the request - keep this minimal for performance
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/admin/monitoring/:path*',
  ],
} 