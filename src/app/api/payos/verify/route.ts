import { NextRequest, NextResponse } from 'next/server';
import { PayOS, PaymentRequests } from '@payos/node';
import { getToken } from 'next-auth/jwt';
import { db } from '@/lib/db';
import { orders, transactions } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/payos/verify?orderCode=xxx
 * Verifies payment status directly with PayOS.
 * Used by the checkout page to poll payment status and by the complete page.
 *
 * Also updates local DB when payment is confirmed as PAID — acts as
 * a backup for the webhook in case webhook delivery is delayed.
 */
export async function GET(req: NextRequest) {
    try {
        const token = await getToken({ req });
        if (!token?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orderCode = req.nextUrl.searchParams.get('orderCode');
        if (!orderCode) {
            return NextResponse.json({ error: 'Missing orderCode' }, { status: 400 });
        }

        const payosClient = new PayOS({
            clientId: process.env.PAYOS_CLIENT_ID!,
            apiKey: process.env.PAYOS_API_KEY!,
            checksumKey: process.env.PAYOS_CHECKSUM_KEY!,
        });

        const paymentRequests = new PaymentRequests(payosClient);
        const paymentInfo = await paymentRequests.get(orderCode);

        // Sync DB status when PayOS confirms PAID (backup for webhook)
        if (paymentInfo.status === 'PAID') {
            const [txn] = await db
                .select({ id: transactions.id, orderId: transactions.orderId, status: transactions.status })
                .from(transactions)
                .where(eq(transactions.gatewayTransactionId, orderCode))
                .limit(1);

            if (txn && txn.status !== 'COMPLETED') {
                await db.update(transactions).set({ status: 'COMPLETED' }).where(eq(transactions.id, txn.id));
                if (txn.orderId) {
                    await db.update(orders).set({ status: 'COMPLETED' }).where(eq(orders.id, txn.orderId));
                }
            }
        }

        return NextResponse.json({
            status: paymentInfo.status,
            orderCode: paymentInfo.orderCode,
            amount: paymentInfo.amount,
        });
    } catch (error) {
        console.error('[PayOS Verify] Error:', error);
        return NextResponse.json(
            { status: 'FAILED', error: 'Verification failed' },
            { status: 200 } // Return 200 so frontend can handle gracefully
        );
    }
}
