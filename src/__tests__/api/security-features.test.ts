import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db', () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    limit: vi.fn(() => [{ loginVerification: false }]),
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
    users: { id: 'id', loginVerification: 'loginVerification' },
}));

vi.mock('@/lib/track-device', () => ({
    trackDevice: vi.fn(() => Promise.resolve()),
}));

vi.mock('@/lib/audit-logger', () => ({
    logAuditEvent: vi.fn(),
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

describe('POST /api/account/track-device', () => {
    beforeEach(() => { vi.resetModules(); });

    it('should return 200 on successful device tracking', async () => {
        const { POST } = await import('@/app/api/account/track-device/route');
        const req = new Request('http://test.com/api/account/track-device', {
            method: 'POST',
            headers: {
                'user-agent': 'Mozilla/5.0 Chrome/120',
                'x-forwarded-for': '192.168.1.1',
            },
        }) as unknown as import('next/server').NextRequest;

        const response = await POST(req);
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
    });
});

describe('GET /api/account/security/login-verification', () => {
    beforeEach(() => { vi.resetModules(); });

    it('should return login verification status', async () => {
        const { GET } = await import('@/app/api/account/security/login-verification/route');
        const response = await GET();
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(typeof body.enabled).toBe('boolean');
    });
});

describe('PUT /api/account/security/login-verification', () => {
    beforeEach(() => { vi.resetModules(); });

    it('should toggle login verification', async () => {
        const { PUT } = await import('@/app/api/account/security/login-verification/route');
        const response = await PUT();
        expect(response.status).toBe(200);
    });
});
