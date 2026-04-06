import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  /^\/dashboard/,
  /^\/tenant/,
  /^\/saas/,
  /^\/settings/,
  /^\/appointments/,
  /^\/patients/,
  /^\/users/,
  /^\/analytics/,
]);

function createRouteMatcher(patterns: RegExp[]) {
  return (request: NextRequest) => {
    const pathname = request.nextUrl.pathname;
    return patterns.some((pattern) => pattern.test(pathname));
  };
}

const isClerkConfigured = () => {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;
  
  return Boolean(
    publishableKey &&
    !publishableKey.includes('placeholder') &&
    secretKey &&
    !secretKey.includes('placeholder')
  );
};

export default async function middleware(request: NextRequest) {
  if (!isClerkConfigured()) {
    return NextResponse.next();
  }

  try {
    const { auth } = await import('@clerk/nextjs/server');
    
    const isProtected = isProtectedRoute(request);
    
    if (isProtected) {
      const authObject = await auth();
      if (!authObject.userId) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    const authObject = await auth();
    const { userId, sessionClaims } = authObject;

    if (userId) {
      const role = (sessionClaims?.metadata as Record<string, unknown>)?.role as string | undefined;
      const pathname = request.nextUrl.pathname;

      if (role === 'SUPERADMIN' || role === 'OPERATOR') {
        if (pathname.startsWith('/tenant') || pathname.startsWith('/dashboard')) {
          return NextResponse.redirect(new URL('/saas', request.url));
        }
      } else if (role === 'CLIENT' || role === 'SUBORDINATE') {
        if (pathname.startsWith('/saas')) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }

      if (pathname === '/login' || pathname === '/signup' || pathname === '/') {
        if (role === 'SUPERADMIN' || role === 'OPERATOR') {
          return NextResponse.redirect(new URL('/saas', request.url));
        }
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  } catch {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
