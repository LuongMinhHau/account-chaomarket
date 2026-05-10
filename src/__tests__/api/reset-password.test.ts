import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@/lib/db', () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    limit: vi.fn(() => []),
                    orderBy: vi.fn(() => ({
                        limit: vi.fn(() => []),
                    })),
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
    otpCodes: { id: 'id' },
}));

vi.mock('@/lib/auth-rate-limit', () => ({
    checkAuthRateLimit: vi.fn(() => null),
}));

vi.mock('@/lib/audit-logger', () => ({
    logAuditEvent: vi.fn(),
}));

vi.mock('@/lib/logger', () => ({
    logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
    sendToLogtail: vi.fn(),
    logApiEvent: vi.fn(),
}));

vi.mock('@/lib/brevo', () => ({
    sendEmail: vi.fn(() => Promise.resolve()),
}));

vi.mock('@/lib/email-templates', () => ({
    passwordResetEmail: vi.fn(() => '<html>Reset</html>'),
    passwordChangedEmail: vi.fn(() => '<html>Changed</html>'),
    getEmailSubject: vi.fn(() => 'Password Reset'),
    formatEmailDate: vi.fn(() => '2026-01-01 10:00'),
}));

vi.mock('@/lib/get-email-locale', () => ({
    getEmailLocale: vi.fn(() => 'vi'),
}));

vi.mock('@/utils/generate-id', () => ({
    generateId: vi.fn(() => 'test-id'),
}));

vi.mock('@/lib/otp', () => ({
    generateOTP: vi.fn(() => '654321'),
    hashOTP: vi.fn(() => 'hashed-otp'),
}));

vi.mock('bcryptjs', () => ({
    default: {
        hash: vi.fn(() => Promise.resolve('hashed-password')),
    },
}));

function createRequest(body: Record<string, unknown>, url: string) {
    const req = new Request(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'x-forwarded-for': '10.0.0.1',
            'user-agent': 'Mozilla/5.0 Chrome/120',
        },
    }) as unknown as import('next/server').NextRequest;
    (req as unknown as { ip: string }).ip = '10.0.0.1';
    return req;
}

describe('POST /api/auth/reset-password/request', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should return 400 for invalid email', async () => {
        const { POST } = await import('@/app/api/auth/reset-password/request/route');
        const response = await POST(createRequest(
            { email: 'bad-email' },
            'http://test.com/api/auth/reset-password/request',
        ));
        expect(response.status).toBe(400);
    });

    it('should return 400 for missing email', async () => {
        const { POST } = await import('@/app/api/auth/reset-password/request/route');
        const response = await POST(createRequest(
            {},
            'http://test.com/api/auth/reset-password/request',
        ));
        expect(response.status).toBe(400);
    });
});

describe('POST /api/auth/reset-password/verify', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should return 400 for missing email', async () => {
        const { POST } = await import('@/app/api/auth/reset-password/verify/route');
        const response = await POST(createRequest(
            { otp: '123456' },
            'http://test.com/api/auth/reset-password/verify',
        ));
        expect(response.status).toBe(400);
    });

    it('should return 400 for missing OTP', async () => {
        const { POST } = await import('@/app/api/auth/reset-password/verify/route');
        const response = await POST(createRequest(
            { email: 'test@test.com' },
            'http://test.com/api/auth/reset-password/verify',
        ));
        expect(response.status).toBe(400);
    });
});

describe('POST /api/auth/reset-password/change', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should return 400 for weak password', async () => {
        const { POST } = await import('@/app/api/auth/reset-password/change/route');
        const response = await POST(createRequest(
            { email: 'test@test.com', password: 'weak', otp: '123456' },
            'http://test.com/api/auth/reset-password/change',
        ));
        expect(response.status).toBe(400);
    });

    it('should return 400 for missing password', async () => {
        const { POST } = await import('@/app/api/auth/reset-password/change/route');
        const response = await POST(createRequest(
            { email: 'test@test.com', otp: '123456' },
            'http://test.com/api/auth/reset-password/change',
        ));
        expect(response.status).toBe(400);
    });

    it('should return 400 for missing OTP', async () => {
        const { POST } = await import('@/app/api/auth/reset-password/change/route');
        const response = await POST(createRequest(
            { email: 'test@test.com', password: 'Test@1234' },
            'http://test.com/api/auth/reset-password/change',
        ));
        expect(response.status).toBe(400);
    });

    it('should return 400 for password without special char', async () => {
        const { POST } = await import('@/app/api/auth/reset-password/change/route');
        const response = await POST(createRequest(
            { email: 'test@test.com', password: 'TestTest1234', otp: '123456' },
            'http://test.com/api/auth/reset-password/change',
        ));
        expect(response.status).toBe(400);
    });
});
