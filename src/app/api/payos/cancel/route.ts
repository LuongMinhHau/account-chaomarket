import { NextRequest, NextResponse } from 'next/server';
import { PaymentRequests } from '@payos/node';
import payos from '@/lib/payos';
import { getToken } from 'next-auth/jwt';
import { db } from '@/lib/db';
import { orders, transactions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';

/**
 * POST /api/payos/cancel
 * Cancels a payment link on PayOS and updates local DB status.
 * Called when user is redirected back with status=cancelled.
 */
export async function POST(req: NextRequest) {
    try {
        const token = await getToken({ req });
        if (!token?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { transactionCode } = await req.json();
        if (!transactionCode) {
            return NextResponse.json({ error: 'Missing transactionCode' }, { status: 400 });
        }

        const transactionCodeStr = String(transactionCode);

        // Update local DB: transaction status → CANCELLED
        const [txn] = await db
            .select({ id: transactions.id, orderId: transactions.orderId })
            .from(transactions)
            .where(eq(transactions.gatewayTransactionId, transactionCodeStr))
            .limit(1);

        if (txn) {
            await db
                .update(transactions)
                .set({ status: 'CANCELLED' })
                .where(eq(transactions.id, txn.id));

            if (txn.orderId) {
                await db
                    .update(orders)
                    .set({ status: 'CANCELLED' })
                    .where(eq(orders.id, txn.orderId));
            }
        }

        // Try to cancel on PayOS (best effort — may already be cancelled)
        try {
            const paymentRequests = new PaymentRequests(payos);
            await paymentRequests.cancel(transactionCodeStr, 'User cancelled');
        } catch (err) {
            // PayOS cancel may fail if already cancelled — that's OK
            logger.warn({ err, transactionCode: transactionCodeStr }, '[PayOS Cancel] Best-effort cancel failed');
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error({ err: error }, '[PayOS Cancel] Error');
        return NextResponse.json(
            { success: false, error: 'Cancel failed' },
            { status: 500 }
        );
    }
}
