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
        insert: vi.fn(() => ({
            values: vi.fn(() => ({
                returning: vi.fn(() => [{ id: 'new-user', email: 'test@test.com', name: 'Test' }]),
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
        hash: vi.fn(() => Promise.resolve('hashed-password')),
        compare: vi.fn(() => Promise.resolve(false)),
    },
}));

describe('POST /api/auth/register', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should return 400 when email is missing', async () => {
        const { POST } = await import('@/app/api/auth/register/route');
        const request = new Request('http://test.com/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ password: 'Test@1234' }),
            headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '1.2.3.4' },
        }) as unknown as import('next/server').NextRequest;
        (request as unknown as { ip: string }).ip = '1.2.3.4';

        const response = await POST(request);
        expect(response.status).toBe(400);
    });

    it('should return 400 when password is weak', async () => {
        const { POST } = await import('@/app/api/auth/register/route');
        const request = new Request('http://test.com/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email: 'test@test.com', password: 'weak', name: 'Test', gender: 'male' }),
            headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '1.2.3.4' },
        }) as unknown as import('next/server').NextRequest;
        (request as unknown as { ip: string }).ip = '1.2.3.4';

        const response = await POST(request);
        expect(response.status).toBe(400);
    });

    it('should return 400 when name is missing', async () => {
        const { POST } = await import('@/app/api/auth/register/route');
        const request = new Request('http://test.com/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email: 'test@test.com', password: 'Test@1234' }),
            headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '1.2.3.4' },
        }) as unknown as import('next/server').NextRequest;
        (request as unknown as { ip: string }).ip = '1.2.3.4';

        const response = await POST(request);
        expect(response.status).toBe(400);
    });

    it('should return 201 on successful registration', async () => {
        const { POST } = await import('@/app/api/auth/register/route');
        const request = new Request('http://test.com/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                email: 'test@test.com',
                password: 'Test@1234',
                name: 'Test User',
                gender: 'male',
            }),
            headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '1.2.3.4' },
        }) as unknown as import('next/server').NextRequest;
        (request as unknown as { ip: string }).ip = '1.2.3.4';

        const response = await POST(request);
        expect(response.status).toBe(201);
    });
});

describe('POST /api/auth/verify-password', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('should return 400 when email is missing', async () => {
        const { POST } = await import('@/app/api/auth/verify-password/route');
        const request = new Request('http://test.com/api/auth/verify-password', {
            method: 'POST',
            body: JSON.stringify({ password: 'test' }),
            headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '1.2.3.4' },
        }) as unknown as import('next/server').NextRequest;
        (request as unknown as { ip: string }).ip = '1.2.3.4';

        const response = await POST(request);
        expect(response.status).toBe(400);
    });

    it('should return 401 when user not found', async () => {
        const { POST } = await import('@/app/api/auth/verify-password/route');
        const request = new Request('http://test.com/api/auth/verify-password', {
            method: 'POST',
            body: JSON.stringify({ email: 'none@test.com', password: 'test' }),
            headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '1.2.3.4' },
        }) as unknown as import('next/server').NextRequest;
        (request as unknown as { ip: string }).ip = '1.2.3.4';

        const response = await POST(request);
        expect(response.status).toBe(401);
    });
});
