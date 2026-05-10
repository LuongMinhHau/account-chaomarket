import { NextRequest, NextResponse } from 'next/server';
import { PaymentRequests } from '@payos/node';
import payos from '@/lib/payos';
import { getToken } from 'next-auth/jwt';
import { db } from '@/lib/db';
import { orders, transactions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';

/**
 * GET /api/payos/verify?transactionCode=xxx
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

        const transactionCode = req.nextUrl.searchParams.get('transactionCode');
        if (!transactionCode) {
            return NextResponse.json({ error: 'Missing transactionCode' }, { status: 400 });
        }

        const paymentRequests = new PaymentRequests(payos);
        const paymentInfo = await paymentRequests.get(transactionCode);

        // Sync DB status when PayOS confirms PAID (backup for webhook)
        if (paymentInfo.status === 'PAID') {
            const [txn] = await db
                .select({ id: transactions.id, orderId: transactions.orderId, status: transactions.status })
                .from(transactions)
                .where(eq(transactions.gatewayTransactionId, transactionCode))
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
        logger.error({ err: error }, '[PayOS Verify] Error');
        return NextResponse.json(
            { status: 'FAILED', error: 'Verification failed' },
            { status: 200 } // Return 200 so frontend can handle gracefully
        );
    }
}
