import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next()
  }

  const protectedPaths = ['/dashboard', '/saas', '/tenant', '/settings']
  const authPaths = ['/login', '/signup']

  const isProtected = protectedPaths.some(p => pathname.startsWith(p))
  const isAuthPage = authPaths.some(p => pathname === p)

  // For protected routes, check for auth cookie
  if (isProtected) {
    const accessToken = request.cookies.get('sb-access-token')?.value
    const refreshToken = request.cookies.get('sb-refresh-token')?.value

    if (!accessToken && !refreshToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // For auth pages, if user has tokens, redirect based on role
  if (isAuthPage) {
    const accessToken = request.cookies.get('sb-access-token')?.value
    const userMetadata = request.cookies.get('sb-user-metadata')?.value

    if (accessToken) {
      try {
        const metadata = userMetadata ? JSON.parse(decodeURIComponent(userMetadata)) : {}
        const role = metadata.role

        if (role === 'SUPERADMIN') {
          return NextResponse.redirect(new URL('/saas', request.url))
        }
        return NextResponse.redirect(new URL('/dashboard', request.url))
      } catch {
        // Invalid metadata, continue to auth page
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
