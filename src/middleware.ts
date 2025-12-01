import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'admin_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (except the login page itself)
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    const session = request.cookies.get(COOKIE_NAME);

    if (!session?.value) {
      // Redirect to admin login
      const loginUrl = new URL('/admin', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Basic validation - check if session looks valid
    try {
      const decoded = Buffer.from(session.value, 'base64').toString();
      const adminPassword = process.env.ADMIN_PASSWORD;
      
      if (!adminPassword || !decoded.includes(adminPassword)) {
        const loginUrl = new URL('/admin', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      const loginUrl = new URL('/admin', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

