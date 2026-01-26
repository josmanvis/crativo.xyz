import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple password protection for /blog
const BLOG_PASSWORD = process.env.BLOG_PASSWORD || 'crativo2026';

export function middleware(request: NextRequest) {
  // Only protect /blog routes
  if (request.nextUrl.pathname.startsWith('/blog')) {
    const authHeader = request.headers.get('authorization');

    if (authHeader) {
      const [scheme, encoded] = authHeader.split(' ');

      if (scheme === 'Basic') {
        const decoded = atob(encoded);
        const [user, password] = decoded.split(':');

        if (password === BLOG_PASSWORD) {
          return NextResponse.next();
        }
      }
    }

    // Return 401 with WWW-Authenticate header to trigger browser's basic auth prompt
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Blog Access"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/blog/:path*',
};
