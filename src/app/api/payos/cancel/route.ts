import { NextRequest, NextResponse } from 'next/server';
import { PayOS, PaymentRequests } from '@payos/node';
import { getToken } from 'next-auth/jwt';
import { db } from '@/lib/db';
import { orders, transactions } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

        const { orderCode } = await req.json();
        if (!orderCode) {
            return NextResponse.json({ error: 'Missing orderCode' }, { status: 400 });
        }

        const orderCodeStr = String(orderCode);

        // Update local DB: transaction status → CANCELLED
        const [txn] = await db
            .select({ id: transactions.id, orderId: transactions.orderId })
            .from(transactions)
            .where(eq(transactions.gatewayTransactionId, orderCodeStr))
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
            const payosClient = new PayOS({
                clientId: process.env.PAYOS_CLIENT_ID!,
                apiKey: process.env.PAYOS_API_KEY!,
                checksumKey: process.env.PAYOS_CHECKSUM_KEY!,
            });
            const paymentRequests = new PaymentRequests(payosClient);
            await paymentRequests.cancel(orderCodeStr, 'User cancelled');
        } catch {
            // PayOS cancel may fail if already cancelled — that's OK
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[PayOS Cancel] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Cancel failed' },
            { status: 500 }
        );
    }
}
