import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Next.js Middleware — Authentication Guard
 *
 * Protects all page routes EXCEPT public paths (auth, API, static assets).
 * Runs BEFORE page rendering — unauthenticated users never see protected content.
 *
 * NOTE: This logic is inlined (not re-exported from src/proxy.ts) because
 * Next.js standalone output requires middleware dependencies to be statically
 * traceable for the NFT (Node File Trace) step.
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ── Public paths — skip auth check ──
    const publicPaths = [
        '/auth',
        '/api',
        '/_next',
        '/favicon',
        '/icon',
        '/img',
        '/sitemap',
        '/robots',
        '/health',
        '/about',
        '/cookie-policy',
        '/privacy-policy',
        '/support-policy',
        '/terms-of-use',
        '/monitoring',
        '/purchase',
        '/checkout',
        '/consultation',
    ];

    if (publicPaths.some(path => pathname.startsWith(path)) || pathname === '/') {
        const response = NextResponse.next();
        applySecurityHeaders(response);
        return response;
    }

    // ── Check session token ──
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // ── Authenticated — allow through with security headers ──
    const response = NextResponse.next();
    applySecurityHeaders(response);
    return response;
}

/**
 * Apply enterprise security headers to all responses.
 * Defense-in-depth layer — complements next.config.ts headers.
 */
function applySecurityHeaders(response: NextResponse) {
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}

/**
 * Matcher config — must be inline for Next.js static analysis.
 */
export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)',
    ],
};
