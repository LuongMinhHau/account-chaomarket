import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/db', () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    limit: vi.fn(() => [{
                        id: 'user-1', password: 'hashed', name: 'Test',
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
    users: { id: 'id', email: 'email', password: 'password' },
}));

vi.mock('@/lib/auth-rate-limit', () => ({
    checkAuthRateLimit: vi.fn(() => null),
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

vi.mock('bcryptjs', () => ({
    default: {
        compare: vi.fn(() => Promise.resolve(true)),
        hash: vi.fn(() => Promise.resolve('new-hashed')),
    },
}));

vi.mock('next-auth', () => ({
    getServerSession: vi.fn(() => Promise.resolve({
        user: { id: 'user-1', email: 'test@test.com' },
    })),
}));

vi.mock('@/lib/next-auth.config', () => ({
    authOptions: {},
}));

function createRequest(body: Record<string, unknown>) {
    return new Request('http://test.com/api/account/security/change-password', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    }) as unknown as import('next/server').NextRequest;
}

describe('POST /api/account/security/change-password', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should return 400 for missing currentPassword', async () => {
        const { POST } = await import('@/app/api/account/security/change-password/route');
        const response = await POST(createRequest({
            newPassword: 'NewPass@123',
        }));
        expect(response.status).toBe(400);
    });

    it('should return 400 for weak new password (no special char)', async () => {
        const { POST } = await import('@/app/api/account/security/change-password/route');
        const response = await POST(createRequest({
            currentPassword: 'OldPass@123',
            newPassword: 'NoSpecial123',
        }));
        expect(response.status).toBe(400);
    });

    it('should return 400 for new password too short', async () => {
        const { POST } = await import('@/app/api/account/security/change-password/route');
        const response = await POST(createRequest({
            currentPassword: 'OldPass@123',
            newPassword: 'Ab@1',
        }));
        expect(response.status).toBe(400);
    });

    it('should return 400 for new password without uppercase', async () => {
        const { POST } = await import('@/app/api/account/security/change-password/route');
        const response = await POST(createRequest({
            currentPassword: 'OldPass@123',
            newPassword: 'lowercase@123',
        }));
        expect(response.status).toBe(400);
    });

    it('should return 400 for new password without number', async () => {
        const { POST } = await import('@/app/api/account/security/change-password/route');
        const response = await POST(createRequest({
            currentPassword: 'OldPass@123',
            newPassword: 'NoNumber@Here',
        }));
        expect(response.status).toBe(400);
    });

    it('should accept valid password change', async () => {
        const { POST } = await import('@/app/api/account/security/change-password/route');
        const response = await POST(createRequest({
            currentPassword: 'OldPass@123',
            newPassword: 'NewValid@Pass1',
        }));
        expect(response.status).toBe(200);
    });
});
