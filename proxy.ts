// proxy.ts
import { withAuth } from 'next-auth/middleware'

// Next.js now expects the middleware function to be exported as 'proxy'
export const proxy = withAuth

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/pos/:path*', 
    '/inventory/:path*'
  ]
}