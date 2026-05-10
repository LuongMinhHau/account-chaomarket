import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@/lib/db', () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    limit: vi.fn(() => [{ totpEnabled: false, totpSecret: null }]),
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
    users: {
        id: 'id', email: 'email',
        totpEnabled: 'totpEnabled', totpSecret: 'totpSecret',
        totpBackupCodes: 'totpBackupCodes',
    },
}));

vi.mock('@/lib/rate-limiter', () => ({
    checkRateLimit: vi.fn(() => true),
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

vi.mock('otplib', () => ({
    generateSecret: vi.fn(() => 'JBSWY3DPEHPK3PXP'),
    generateURI: vi.fn(() => 'otpauth://totp/Test:test@test.com?secret=JBSWY3DPEHPK3PXP'),
    verifySync: vi.fn(() => false),
}));

vi.mock('qrcode', () => ({
    toDataURL: vi.fn(() => Promise.resolve('data:image/png;base64,abc123')),
}));

vi.mock('bcryptjs', () => ({
    default: {
        hash: vi.fn(() => Promise.resolve('hashed')),
    },
}));

describe('GET /api/account/two-factor', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should return 2FA status', async () => {
        const { GET } = await import('@/app/api/account/two-factor/route');
        const response = await GET();
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(typeof body.enabled).toBe('boolean');
    });
});

describe('PUT /api/account/two-factor (verify TOTP)', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should return 400 for missing code', async () => {
        const { PUT } = await import('@/app/api/account/two-factor/route');
        const req = new Request('http://test.com/api/account/two-factor', {
            method: 'PUT',
            body: JSON.stringify({}),
            headers: { 'Content-Type': 'application/json' },
        }) as unknown as import('next/server').NextRequest;

        const response = await PUT(req);
        expect(response.status).toBe(400);
    });

    it('should return 400 for empty code', async () => {
        const { PUT } = await import('@/app/api/account/two-factor/route');
        const req = new Request('http://test.com/api/account/two-factor', {
            method: 'PUT',
            body: JSON.stringify({ code: '' }),
            headers: { 'Content-Type': 'application/json' },
        }) as unknown as import('next/server').NextRequest;

        const response = await PUT(req);
        expect(response.status).toBe(400);
    });
});
