import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitInfo } from './rate-limiter';

function getClientIp(request: NextRequest): string {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        request.headers.get('cf-connecting-ip') ||
        'unknown'
    );
}

const AUTH_RATE_LIMITS = {
    login:            { max: 10, windowMs: 15 * 60 * 1000 },  // 10 attempts per 15 min
    'verify-password':{ max: 10, windowMs: 15 * 60 * 1000 },  // 10 attempts per 15 min
    register:         { max: 5,  windowMs: 15 * 60 * 1000 },
    otp:              { max: 5,  windowMs: 5 * 60 * 1000 },
    'otp-verify':     { max: 10, windowMs: 5 * 60 * 1000 },
    'reset-password': { max: 5,  windowMs: 15 * 60 * 1000 },
} as const;

type AuthAction = keyof typeof AUTH_RATE_LIMITS;

export function checkAuthRateLimit(
    request: NextRequest,
    action: AuthAction,
): NextResponse | null {
    const ip = getClientIp(request);
    const key = `auth:${action}:${ip}`;
    const config = AUTH_RATE_LIMITS[action];

    if (!checkRateLimit(key, config.max, config.windowMs)) {
        const info = getRateLimitInfo(key, config.max, config.windowMs);
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            {
                status: 429,
                headers: {
                    'Retry-After': String(info.resetIn),
                    'X-RateLimit-Limit': String(config.max),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': String(info.resetIn),
                },
            },
        );
    }

    return null;
}
