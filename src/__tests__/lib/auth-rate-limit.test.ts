import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkAuthRateLimit } from '@/lib/auth-rate-limit';
import { checkRateLimit } from '@/lib/rate-limiter';

vi.mock('@/lib/rate-limiter', () => ({
    checkRateLimit: vi.fn(() => true),
    getRateLimitInfo: vi.fn(() => ({ resetIn: 60 })),
}));

function createMockRequest(ip = '192.168.1.1') {
    const req = new Request('http://test.com/api/auth/login', {
        method: 'POST',
        headers: { 'x-forwarded-for': ip },
    }) as unknown as import('next/server').NextRequest;
    return req;
}

describe('checkAuthRateLimit', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return null when under rate limit', () => {
        vi.mocked(checkRateLimit).mockReturnValue(true);
        const result = checkAuthRateLimit(createMockRequest(), 'login');
        expect(result).toBeNull();
    });

    it('should return 429 response when rate limited', async () => {
        vi.mocked(checkRateLimit).mockReturnValue(false);
        const result = checkAuthRateLimit(createMockRequest(), 'login');
        expect(result).not.toBeNull();
        expect(result!.status).toBe(429);
        const body = await result!.json();
        expect(body.error).toContain('Too many requests');
    });

    it('should include rate limit headers in 429 response', async () => {
        vi.mocked(checkRateLimit).mockReturnValue(false);
        const result = checkAuthRateLimit(createMockRequest(), 'register');
        expect(result).not.toBeNull();
        expect(result!.headers.get('Retry-After')).toBeDefined();
        expect(result!.headers.get('X-RateLimit-Limit')).toBeDefined();
        expect(result!.headers.get('X-RateLimit-Remaining')).toBe('0');
    });

    it('should use correct IP from x-forwarded-for header', () => {
        vi.mocked(checkRateLimit).mockReturnValue(true);
        checkAuthRateLimit(createMockRequest('10.0.0.1'), 'otp');
        expect(vi.mocked(checkRateLimit)).toHaveBeenCalledWith(
            'auth:otp:10.0.0.1',
            expect.any(Number),
            expect.any(Number),
        );
    });

    it('should apply different limits for different actions', () => {
        vi.mocked(checkRateLimit).mockReturnValue(true);

        checkAuthRateLimit(createMockRequest(), 'login');
        const loginCall = vi.mocked(checkRateLimit).mock.calls[0];

        checkAuthRateLimit(createMockRequest(), 'register');
        const registerCall = vi.mocked(checkRateLimit).mock.calls[1];

        // login allows 10, register allows 5
        expect(loginCall[1]).toBe(10);
        expect(registerCall[1]).toBe(5);
    });
});
