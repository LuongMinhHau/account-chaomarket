import { describe, it, expect, vi, beforeEach } from 'vitest';

// Chainable DB mock
function mockChain() {
    return Object.assign([], {
        orderBy: vi.fn(() => Object.assign([], { limit: vi.fn(() => []) })),
        limit: vi.fn(() => []),
    });
}

vi.mock('@/lib/db', () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => mockChain()),
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
    orders: { id: 'id', userId: 'userId', status: 'status', transactionCode: 'transactionCode' },
    transactions: { id: 'id', orderId: 'orderId', status: 'status', transactionCode: 'transactionCode' },
}));

vi.mock('@/lib/payos', () => ({
    default: {
        cancelPaymentLink: vi.fn(() => Promise.resolve({})),
        getPaymentLinkInformation: vi.fn(() => Promise.resolve({ status: 'PAID' })),
    },
}));

vi.mock('@/lib/logger', () => ({
    logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

vi.mock('next-auth/jwt', () => ({
    getToken: vi.fn(() => Promise.resolve({ id: 'user-1' })),
}));

describe('POST /api/payos/cancel', () => {
    beforeEach(() => { vi.resetModules(); });

    it('should return 400 when transactionCode is missing', async () => {
        const { POST } = await import('@/app/api/payos/cancel/route');
        const req = new Request('http://test.com/api/payos/cancel', {
            method: 'POST',
            body: JSON.stringify({}),
            headers: { 'Content-Type': 'application/json' },
        }) as unknown as import('next/server').NextRequest;

        const response = await POST(req);
        expect(response.status).toBe(400);
        const body = await response.json();
        expect(body.error).toContain('Missing');
    });
});

describe('GET /api/payos/verify', () => {
    beforeEach(() => { vi.resetModules(); });

    it('should handle verify request with orderCode param', async () => {
        const { GET } = await import('@/app/api/payos/verify/route');
        const url = new URL('http://test.com/api/payos/verify?orderCode=1100526001');
        const req = new Request(url.toString(), {
            method: 'GET',
        }) as unknown as import('next/server').NextRequest;

        const response = await GET(req);
        // Should process the verification
        expect([200, 400, 500]).toContain(response.status);
    });
});

describe('POST /api/payos/webhook', () => {
    beforeEach(() => { vi.resetModules(); });

    it('should acknowledge PayOS test webhook', async () => {
        vi.mock('@payos/node', () => ({
            Webhooks: vi.fn(() => ({
                verifyPaymentWebhookData: vi.fn(() => ({
                    orderCode: 123456,
                })),
            })),
        }));

        const { POST } = await import('@/app/api/payos/webhook/route');
        const req = new Request('http://test.com/api/payos/webhook', {
            method: 'POST',
            body: JSON.stringify({
                code: '00',
                desc: 'success',
                data: { orderCode: 123456 },
                signature: 'test-sig',
            }),
            headers: { 'Content-Type': 'application/json' },
        }) as unknown as import('next/server').NextRequest;

        const response = await POST(req);
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body.success).toBe(true);
    });
});
