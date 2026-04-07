import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    return NextResponse.next()
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
      },
    },
  })

  try {
    const { data: { user } } = await supabase.auth.getUser()
    const pathname = request.nextUrl.pathname

    const protectedPaths = ['/dashboard', '/saas', '/tenant', '/settings']
    const isProtected = protectedPaths.some(p => pathname.startsWith(p))

    if (isProtected && !user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (user) {
      const role = user.user_metadata?.role as string | undefined

      if (['/', '/login', '/signup'].includes(pathname)) {
        if (role === 'SUPERADMIN') {
          return NextResponse.redirect(new URL('/saas', request.url))
        }
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  } catch (error) {
    console.error('Middleware auth error:', error)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
