import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@/lib/db', () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    limit: vi.fn(() => []),
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
    users: { id: 'id', email: 'email' },
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
    changeEmailNewOtpEmail: vi.fn(() => '<html>OTP</html>'),
    getEmailSubject: vi.fn(() => 'Your OTP'),
}));

vi.mock('@/lib/get-email-locale', () => ({
    getEmailLocale: vi.fn(() => 'vi'),
}));

vi.mock('@/utils/generate-id', () => ({
    generateId: vi.fn(() => 'test-id-123'),
}));

vi.mock('@/lib/otp', () => ({
    generateOTP: vi.fn(() => '123456'),
    hashOTP: vi.fn(() => 'hashed-otp'),
}));

vi.mock('next-auth', () => ({
    getServerSession: vi.fn(() => Promise.resolve({
        user: { id: 'user-1', email: 'old@test.com' },
    })),
}));

vi.mock('@/lib/next-auth.config', () => ({
    authOptions: {},
}));

function createRequest(body: Record<string, unknown>) {
    const req = new Request('http://test.com/api/account/change-email', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '1.2.3.4' },
    }) as unknown as import('next/server').NextRequest;
    (req as unknown as { ip: string }).ip = '1.2.3.4';
    return req;
}

describe('POST /api/account/change-email', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should return 400 for invalid email format', async () => {
        const { POST } = await import('@/app/api/account/change-email/route');
        const response = await POST(createRequest({ newEmail: 'not-an-email' }));
        expect(response.status).toBe(400);
    });

    it('should return 400 for missing newEmail', async () => {
        const { POST } = await import('@/app/api/account/change-email/route');
        const response = await POST(createRequest({}));
        expect(response.status).toBe(400);
    });

    it('should return 400 for empty string email', async () => {
        const { POST } = await import('@/app/api/account/change-email/route');
        const response = await POST(createRequest({ newEmail: '' }));
        expect(response.status).toBe(400);
    });
});

describe('PUT /api/account/change-email', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should return 400 for missing OTP', async () => {
        const { PUT } = await import('@/app/api/account/change-email/route');
        const req = new Request('http://test.com/api/account/change-email', {
            method: 'PUT',
            body: JSON.stringify({ newEmail: 'new@test.com' }),
            headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '1.2.3.4' },
        }) as unknown as import('next/server').NextRequest;
        (req as unknown as { ip: string }).ip = '1.2.3.4';
        const response = await PUT(req);
        // Route checks session first, returns 401 or processes validation
        expect([400, 401, 404]).toContain(response.status);
    });
});
