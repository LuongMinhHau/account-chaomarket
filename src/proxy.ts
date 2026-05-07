import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Server-side authentication proxy.
 *
 * Protects all page routes EXCEPT public paths (auth, API, static assets).
 * Runs BEFORE page rendering — unauthenticated users never see protected content.
 *
 * Flow:
 *   1. User visits /profile → proxy checks JWT token
 *   2. No token → 302 redirect to /auth/login?callbackUrl=/profile
 *   3. Has token → allow through to page
 */
export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ── Public paths — skip auth check ──
    // Auth pages, API routes, static assets, legal/public pages, Next.js internals
    const publicPaths = [
        '/auth',
        '/api',
        '/_next',
        '/favicon',
        '/icon',
        '/img',
        '/sitemap',
        '/robots',
        // Legal & public pages (must be accessible without login)
        '/health',
        '/about',
        '/cookie-policy',
        '/privacy-policy',
        '/support-policy',
        '/terms-of-use',
        '/monitoring',
    ];

    if (publicPaths.some(path => pathname.startsWith(path)) || pathname === '/') {
        return NextResponse.next();
    }

    // ── Check session token ──
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
        // No session — redirect to login with callbackUrl
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ── Authenticated — allow through ──
    return NextResponse.next();
}

/**
 * Matcher config — only run proxy on page routes.
 * Excludes: API routes, static files, Next.js internals.
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt
         * - Any file with an extension (e.g. .svg, .png, .css)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)',
    ],
};
