import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('next-auth', () => ({
    getServerSession: vi.fn(),
}));

vi.mock('@/lib/next-auth.config', () => ({
    authOptions: {},
}));

vi.mock('@/lib/db', () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    limit: vi.fn(() => [{ totpEnabled: false, loginVerification: true }]),
                })),
            })),
        })),
        update: vi.fn(() => ({
            set: vi.fn(() => ({
                where: vi.fn(),
            })),
        })),
    },
}));

vi.mock('@/db/schema', () => ({
    users: { id: 'id', totpEnabled: 'totpEnabled', loginVerification: 'loginVerification' },
}));

vi.mock('@/lib/rate-limiter', () => ({
    checkRateLimit: vi.fn(() => true),
}));

vi.mock('@/lib/audit-logger', () => ({
    logAuditEvent: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
    logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
    sendToLogtail: vi.fn(),
    logApiEvent: vi.fn(),
}));

vi.mock('@/lib/track-device', () => ({
    trackDevice: vi.fn(),
}));

import { getServerSession } from 'next-auth';

describe('GET /api/me', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should return 401 when not authenticated', async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce(null);

        const { GET } = await import('@/app/api/me/route');
        const response = await GET();
        expect(response.status).toBe(401);
    });

    it('should return user data when authenticated', async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce({
            user: { id: 'u1', name: 'Test', email: 'test@test.com', image: null, role: 'user' },
            expires: '',
        });

        const { GET } = await import('@/app/api/me/route');
        const response = await GET();
        expect(response.status).toBe(200);
        const json = await response.json();
        expect(json.user.id).toBe('u1');
    });
});

describe('GET /api/account/security/login-verification', () => {
    it('should return 401 when not authenticated', async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce(null);

        const { GET } = await import('@/app/api/account/security/login-verification/route');
        const response = await GET();
        expect(response.status).toBe(401);
    });
});

describe('POST /api/account/track-device', () => {
    it('should return 401 when not authenticated', async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce(null);

        const { POST } = await import('@/app/api/account/track-device/route');
        const request = new Request('http://test.com', {
            method: 'POST',
            headers: { 'user-agent': 'TestAgent/1.0', 'x-forwarded-for': '1.2.3.4' },
        }) as unknown as import('next/server').NextRequest;

        const response = await POST(request);
        expect(response.status).toBe(401);
    });

    it('should return 200 when authenticated', async () => {
        vi.mocked(getServerSession).mockResolvedValueOnce({
            user: { id: 'u1', email: 'test@test.com' },
            expires: '',
        });

        const { POST } = await import('@/app/api/account/track-device/route');
        const request = new Request('http://test.com', {
            method: 'POST',
            headers: { 'user-agent': 'TestAgent/1.0', 'x-forwarded-for': '1.2.3.4' },
        }) as unknown as import('next/server').NextRequest;

        const response = await POST(request);
        expect(response.status).toBe(200);
    });
});
