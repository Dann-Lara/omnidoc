import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const protectedPaths = ['/admin']
  const authPaths = ['/login', '/signup', '/forgot-password', '/reset-password']
  
  const isAuthPage = authPaths.some(p => pathname === p) || pathname.startsWith('/invitation/')

  // Rutas de tenant: /[slug], /[slug]/dashboard, /[slug]/profile, etc.
  const isTenantRoute = /^\/[^/]+(\/.*)?$/.test(pathname) && !isAuthPage && !pathname.startsWith('/admin')
  
  const isProtected = 
    protectedPaths.some(p => pathname.startsWith(p)) ||
    /^\/[^/]+\/dashboard/.test(pathname) ||
    (/^\/[^/]+$/.test(pathname) && !isAuthPage)

  if (isProtected) {
    const accessToken = request.cookies.get('sb-access-token')?.value
    const refreshToken = request.cookies.get('sb-refresh-token')?.value

    if (!accessToken && !refreshToken) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    const userRole = request.cookies.get('sb-user-role')?.value

    const operatorBlockedPaths = ['/admin/operators', '/admin/settings', '/admin/config']
    const isOperatorBlocked = operatorBlockedPaths.some(p => pathname.startsWith(p))

    if (userRole === 'OPERATOR' && isOperatorBlocked) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // Verificar cookie org-slug para rutas de tenant
  if (isTenantRoute) {
    const userRole = request.cookies.get('sb-user-role')?.value
    
    // Si es SUPERADMIN u OPERATOR, ir a /admin
    if (userRole === 'SUPERADMIN' || userRole === 'OPERATOR') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    
    const orgSlug = request.cookies.get('sb-org-slug')?.value
    if (!orgSlug) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Verificar que el slug en la URL coincida con el cookie
    const urlSlug = pathname.split('/')[1]
    if (urlSlug !== orgSlug) {
      // Redirigir al slug correcto
      return NextResponse.redirect(new URL(`/${orgSlug}${pathname.slice(urlSlug.length + 1)}`, request.url))
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
    '/invitation/:path*',
  ],
}
