// Utility functions for license API: HMAC signing and rate limiting

import { createHmac, randomUUID } from 'crypto';

// ─── i18n messages for license API responses ───
export const LICENSE_MESSAGES = {
    // Auth
    AUTH_RATE_LIMITED: { en: 'Too many login attempts. Please try again later.', vi: 'Quá nhiều lần đăng nhập. Vui lòng thử lại sau.' },
    AUTH_MISSING_FIELDS: { en: 'Email, password, and productId are required.', vi: 'Email, mật khẩu và productId là bắt buộc.' },
    AUTH_INVALID_CREDENTIALS: { en: 'Invalid email or password.', vi: 'Email hoặc mật khẩu không đúng.' },
    AUTH_ACCOUNT_SUSPENDED: { en: 'Account is suspended.', vi: 'Tài khoản đã bị khóa.' },
    AUTH_NO_ENTITLEMENT: { en: 'No active entitlement found for this product.', vi: 'Không tìm thấy quyền sử dụng sản phẩm này.' },
    AUTH_EXPIRED: { en: 'Entitlement has expired.', vi: 'Quyền sử dụng đã hết hạn.' },
    AUTH_MAX_DEVICES: { en: 'Maximum linked devices reached.', vi: 'Đã đạt giới hạn số thiết bị liên kết.' },
    AUTH_SUCCESS: { en: 'Authenticated successfully.', vi: 'Đăng nhập thành công.' },

    // Token
    TOKEN_REQUIRED: { en: 'Token is required.', vi: 'Token là bắt buộc.' },
    TOKEN_INVALID: { en: 'Invalid token.', vi: 'Token không hợp lệ.' },
    TOKEN_INVALIDATED: { en: 'Session expired due to password change. Please login again.', vi: 'Phiên đã hết hạn do đổi mật khẩu. Vui lòng đăng nhập lại.' },
    TOKEN_EXPIRED: { en: 'Token has expired. Please login again.', vi: 'Token đã hết hạn. Vui lòng đăng nhập lại.' },
    TOKEN_NO_PRODUCT: { en: 'No product associated with this token.', vi: 'Không có sản phẩm liên kết với token này.' },

    // Entitlement
    ENT_NOT_FOUND: { en: 'No active entitlement found.', vi: 'Không tìm thấy quyền sử dụng.' },
    ENT_EXPIRED: { en: 'Entitlement has expired.', vi: 'Quyền sử dụng đã hết hạn.' },
    ENT_REVOKED: { en: 'Entitlement has been revoked.', vi: 'Quyền sử dụng đã bị thu hồi.' },

    // Heartbeat
    HB_MISSING_FIELDS: { en: 'productId, identifier, and identifierType are required.', vi: 'productId, identifier và identifierType là bắt buộc.' },
    HB_DEVICE_NOT_FOUND: { en: 'Device not linked or entitlement not found.', vi: 'Thiết bị chưa liên kết hoặc không tìm thấy quyền.' },

    // General
    RATE_LIMITED: { en: 'Too many requests. Please try again later.', vi: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' },
    INTERNAL_ERROR: { en: 'Internal server error.', vi: 'Lỗi hệ thống.' },

    // Logout
    LOGOUT_SUCCESS: { en: 'Logged out successfully.', vi: 'Đăng xuất thành công.' },
    LOGOUT_TOKEN_NOT_FOUND: { en: 'Token not found.', vi: 'Không tìm thấy token.' },
} as const;

export type LicenseMessageKey = keyof typeof LICENSE_MESSAGES;

function getLicenseApiSecret(): string {
    const secret = process.env.LICENSE_API_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
        throw new Error('LICENSE_API_SECRET environment variable is required in production');
    }
    return secret || 'dev-only-license-secret-not-for-production';
}

/**
 * Sign a response object with HMAC-SHA256.
 * Tool-side can verify the signature to ensure response authenticity.
 */
export function signResponse(data: Record<string, unknown>): string {
    const payload = JSON.stringify(data);
    return createHmac('sha256', getLicenseApiSecret())
        .update(payload)
        .digest('hex');
}

/**
 * Create a signed response by appending timestamp + signature.
 */
export function createSignedResponse(data: Record<string, unknown>) {
    const timestamp = Math.floor(Date.now() / 1000);
    const responseData = { ...data, timestamp };
    const signature = signResponse(responseData);
    return { ...responseData, signature };
}

// ─── In-memory rate limiter ───
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const RATE_LIMIT_MAX = 30; // 30 requests per minute per IP

/**
 * Check if an IP has exceeded the rate limit.
 * Returns true if request is allowed, false if rate-limited.
 */
export function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return true;
    }

    entry.count++;
    if (entry.count > RATE_LIMIT_MAX) {
        return false;
    }

    return true;
}

// Clean up stale entries periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [ip, entry] of rateLimitMap.entries()) {
            if (now > entry.resetAt) {
                rateLimitMap.delete(ip);
            }
        }
    }, 5 * 60 * 1000);
}

// ─── Entitlement helpers (moved from license.ts) ───

/** Product types that get entitlements on purchase */
const LICENSABLE_TYPES = ['indicator', 'tool', 'software', 'ea'];

export function isLicensableType(type: string): boolean {
    return LICENSABLE_TYPES.includes(type.toLowerCase());
}

/** Calculate expiry date from now + N months (handles month-end overflow) */
export function calculateExpiry(durationMonths: number): Date {
    const date = new Date();
    const originalDay = date.getDate();
    date.setMonth(date.getMonth() + durationMonths);
    // Handle month overflow: if day changed (e.g. Jan 31 → Mar 3), clamp to last day of target month
    if (date.getDate() !== originalDay) {
        date.setDate(0); // Sets to last day of the previous month (i.e. the target month)
    }
    return date;
}

// ─── Product auth token helpers ───

/** Generate a random product auth token (UUID v4 format) */
export function generateProductToken(): string {
    return randomUUID();
}

/** Get token expiry date (default: 90 days from now) */
export function getTokenExpiryDate(days: number = 90): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
}

// ─── Stricter rate limiter for /auth (anti brute-force) ───
const authRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const AUTH_RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const AUTH_RATE_LIMIT_MAX = 5; // 5 login attempts per minute per IP

/**
 * Stricter rate limit for authentication endpoints.
 * Only 5 requests per minute per IP to prevent brute-force attacks.
 */
export function checkAuthRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = authRateLimitMap.get(ip);

    if (!entry || now > entry.resetAt) {
        authRateLimitMap.set(ip, { count: 1, resetAt: now + AUTH_RATE_LIMIT_WINDOW_MS });
        return true;
    }

    entry.count++;
    if (entry.count > AUTH_RATE_LIMIT_MAX) {
        return false;
    }

    return true;
}

// Clean up auth rate limit entries
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [ip, entry] of authRateLimitMap.entries()) {
            if (now > entry.resetAt) {
                authRateLimitMap.delete(ip);
            }
        }
    }, 5 * 60 * 1000);
}
