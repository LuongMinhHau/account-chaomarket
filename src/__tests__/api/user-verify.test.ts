import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db', () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    limit: vi.fn(() => [{
                        emailVerified: null,
                    }]),
                })),
            })),
        })),
        update: vi.fn(() => ({
            set: vi.fn(() => ({
                where: vi.fn(() => ({})),
            })),
        })),
    },
}));

vi.mock('@/db/schema', () => ({
    users: { id: 'id', email: 'email', emailVerified: 'emailVerified' },
}));

vi.mock('@/lib/auth-rate-limit', () => ({
    checkAuthRateLimit: vi.fn(() => null),
}));

vi.mock('@/lib/logger', () => ({
    logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
    sendToLogtail: vi.fn(),
}));

vi.mock('next-auth', () => ({
    getServerSession: vi.fn(() => Promise.resolve({
        user: { id: 'user-1', email: 'test@test.com' },
    })),
}));

vi.mock('@/lib/next-auth.config', () => ({
    authOptions: {},
}));

describe('POST /api/user/verify', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should return 400 for invalid email format', async () => {
        const { POST } = await import('@/app/api/user/verify/route');
        const req = new Request('http://test.com/api/user/verify', {
            method: 'POST',
            body: JSON.stringify({ email: 'not-an-email' }),
            headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '1.2.3.4' },
        }) as unknown as import('next/server').NextRequest;
        (req as unknown as { ip: string }).ip = '1.2.3.4';

        const response = await POST(req);
        expect(response.status).toBe(400);
    });

    it('should return 400 for missing email', async () => {
        const { POST } = await import('@/app/api/user/verify/route');
        const req = new Request('http://test.com/api/user/verify', {
            method: 'POST',
            body: JSON.stringify({}),
            headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '1.2.3.4' },
        }) as unknown as import('next/server').NextRequest;
        (req as unknown as { ip: string }).ip = '1.2.3.4';

        const response = await POST(req);
        expect(response.status).toBe(400);
    });
});
