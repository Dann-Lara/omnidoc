import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const protectedPaths = ['/admin', '/tenant']
  const authPaths = ['/login', '/signup']

  const isProtected = protectedPaths.some(p => pathname.startsWith(p))
  const isAuthPage = authPaths.some(p => pathname === p)

  if (isProtected) {
    const accessToken = request.cookies.get('sb-access-token')?.value
    const refreshToken = request.cookies.get('sb-refresh-token')?.value

    if (!accessToken && !refreshToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  if (isAuthPage) {
    const accessToken = request.cookies.get('sb-access-token')?.value

    if (accessToken) {
      return NextResponse.redirect(new URL('/admin', request.url))
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
