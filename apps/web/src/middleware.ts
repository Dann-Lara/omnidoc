import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/tenant(.*)',
  '/saas(.*)',
  '/settings(.*)',
  '/appointments(.*)',
  '/patients(.*)',
  '/users(.*)',
  '/analytics(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  const { userId, sessionClaims } = await auth();

  if (userId) {
    const role = (sessionClaims?.metadata as Record<string, unknown>)?.role as string | undefined;

    const url = new URL(req.url);

    if (role === 'SUPERADMIN' || role === 'OPERATOR') {
      if (url.pathname.startsWith('/tenant') || url.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/saas', req.url));
      }
    } else if (role === 'CLIENT' || role === 'SUBORDINATE') {
      if (url.pathname.startsWith('/saas')) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    if (
      url.pathname === '/login' ||
      url.pathname === '/signup' ||
      url.pathname === '/'
    ) {
      if (role === 'SUPERADMIN' || role === 'OPERATOR') {
        return NextResponse.redirect(new URL('/saas', req.url));
      }
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
