// middleware.ts
export { default } from 'next-auth/middleware'

// Protects all of these pages. If a non-logged-in user tries to visit them, 
// they are instantly kicked back to the /login page.
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/pos/:path*', 
    '/inventory/:path*'
  ]
}