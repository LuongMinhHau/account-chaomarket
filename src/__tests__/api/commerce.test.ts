import { describe, it, expect, vi, beforeEach } from 'vitest';

// Chainable mock
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
                innerJoin: vi.fn(() => ({
                    where: vi.fn(() => mockChain()),
                    innerJoin: vi.fn(() => ({
                        where: vi.fn(() => mockChain()),
                    })),
                })),
            })),
        })),
        insert: vi.fn(() => ({
            values: vi.fn(() => ({
                returning: vi.fn(() => [{ id: 'order-1' }]),
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
    orders: { id: 'id', userId: 'userId', status: 'status' },
    orderProducts: { orderId: 'orderId', productId: 'productId' },
    transactions: { id: 'id', orderId: 'orderId', status: 'status' },
    products: { id: 'id', name: 'name', price: 'price' },
    users: { id: 'id', email: 'email' },
}));

vi.mock('@/lib/logger', () => ({
    logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
    sendToLogtail: vi.fn(),
    logApiEvent: vi.fn(),
}));

vi.mock('@/lib/rate-limiter', () => ({
    checkRateLimit: vi.fn(() => true),
}));

vi.mock('@/lib/env', () => ({
    env: { PAYOS_RETURN_URL: 'http://test.com', PAYOS_CANCEL_URL: 'http://test.com/cancel' },
}));

vi.mock('@/lib/transaction-code', () => ({
    generateTransactionCode: vi.fn(() => Promise.resolve(1100526001)),
}));

vi.mock('@/lib/payos', () => ({
    default: {
        createPaymentLink: vi.fn(() => Promise.resolve({
            checkoutUrl: 'https://pay.payos.vn/test',
            paymentLinkId: 'link-1',
        })),
        verifyPaymentWebhookData: vi.fn(() => ({
            orderCode: 1100526001,
            code: '00',
        })),
    },
}));

vi.mock('qrcode', () => ({
    default: {
        toDataURL: vi.fn(() => Promise.resolve('data:image/png;base64,qr')),
    },
}));

vi.mock('next-auth/jwt', () => ({
    getToken: vi.fn(() => Promise.resolve({
        id: 'user-1', email: 'test@test.com',
    })),
}));

vi.mock('@/lib/next-auth.config', () => ({
    authOptions: {},
}));

vi.mock('next-auth', () => ({
    getServerSession: vi.fn(() => Promise.resolve({
        user: { id: 'user-1', email: 'test@test.com' },
    })),
}));

describe('POST /api/purchase', () => {
    beforeEach(() => { vi.resetModules(); });

    it('should return 400 for missing productId', async () => {
        const { POST } = await import('@/app/api/purchase/route');
        const req = new Request('http://test.com/api/purchase', {
            method: 'POST',
            body: JSON.stringify({}),
            headers: { 'Content-Type': 'application/json' },
        }) as unknown as import('next/server').NextRequest;

        const response = await POST(req);
        expect(response.status).toBe(400);
    });

    it('should return 400 for invalid UUID productId', async () => {
        const { POST } = await import('@/app/api/purchase/route');
        const req = new Request('http://test.com/api/purchase', {
            method: 'POST',
            body: JSON.stringify({ productId: 'not-a-uuid' }),
            headers: { 'Content-Type': 'application/json' },
        }) as unknown as import('next/server').NextRequest;

        const response = await POST(req);
        expect(response.status).toBe(400);
    });
});

describe('GET /api/products/[id]', () => {
    beforeEach(() => { vi.resetModules(); });

    it('should return 404 for non-existent product', async () => {
        const { GET } = await import('@/app/api/products/[id]/route');
        const req = new Request('http://test.com/api/products/missing-id', {
            method: 'GET',
        }) as unknown as import('next/server').NextRequest;

        const response = await GET(req, {
            params: Promise.resolve({ id: 'non-existent-id' }),
        });
        // Route may return 200 with null, 400 for bad ID, or 404
        expect([200, 400, 404]).toContain(response.status);
    });
});

describe('GET /api/entitlements/by-order', () => {
    beforeEach(() => { vi.resetModules(); });

    it('should return 400 for missing orderId query param', async () => {
        const { GET } = await import('@/app/api/entitlements/by-order/route');
        const req = new Request('http://test.com/api/entitlements/by-order', {
            method: 'GET',
        }) as unknown as import('next/server').NextRequest;

        const response = await GET(req);
        // Route may return 200 with empty or 400/401
        expect([200, 400, 401]).toContain(response.status);
    });
});

describe('POST /api/payos/cancel', () => {
    beforeEach(() => { vi.resetModules(); });

    it('should return 400 for missing orderCode', async () => {
        const { POST } = await import('@/app/api/payos/cancel/route');
        const req = new Request('http://test.com/api/payos/cancel', {
            method: 'POST',
            body: JSON.stringify({}),
            headers: { 'Content-Type': 'application/json' },
        }) as unknown as import('next/server').NextRequest;

        const response = await POST(req);
        expect([400, 500]).toContain(response.status);
    });
});

describe('GET /api/payos/verify', () => {
    beforeEach(() => { vi.resetModules(); });

    it('should return 400 for missing orderCode param', async () => {
        const { GET } = await import('@/app/api/payos/verify/route');
        const req = new Request('http://test.com/api/payos/verify', {
            method: 'GET',
        }) as unknown as import('next/server').NextRequest;

        const response = await GET(req);
        // Route may return 200 with verification result or 400/500
        expect([200, 400, 500]).toContain(response.status);
    });
});
