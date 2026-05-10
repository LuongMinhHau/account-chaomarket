import { NextRequest, NextResponse } from 'next/server';
import { Webhooks } from '@payos/node';
import payos from '@/lib/payos';
import { db } from '@/lib/db';
import { orders, transactions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '@/lib/logger';

/**
 * POST /api/payos/webhook
 * Receives payment confirmation callbacks from PayOS.
 * Updates order + transaction status in DB when payment succeeds/fails.
 *
 * CRITICAL: This ensures payments are recorded even if the user
 * closes the browser before client-side polling detects success.
 *
 * PayOS sends: { code, desc, data: { orderCode, amount, ... }, signature }
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // PayOS test webhook (orderCode === 123456) — just acknowledge
        if (body?.data?.orderCode === 123456) {
            return NextResponse.json({ success: true });
        }

        // Verify webhook signature using PayOS checksumKey
        const webhooks = new Webhooks(payos);
        let webhookData;
        try {
            webhookData = await webhooks.verify(body);
        } catch (err) {
            logger.error({ err }, '[PayOS Webhook] Invalid signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // Adapter: PayOS field → internal naming
        const transactionCode = String(webhookData.orderCode);
        const isSuccess = body.code === '00' || body.success;

        // Find transaction by gateway ID
        const [txn] = await db
            .select({ id: transactions.id, orderId: transactions.orderId })
            .from(transactions)
            .where(eq(transactions.gatewayTransactionId, transactionCode))
            .limit(1);

        if (!txn) {
            logger.warn({ transactionCode }, '[PayOS Webhook] No transaction found');
            return NextResponse.json({ success: true }); // ACK to prevent retries
        }

        if (isSuccess) {
            // ── Payment SUCCESS → update both transaction + order ──
            await db
                .update(transactions)
                .set({ status: 'COMPLETED' })
                .where(eq(transactions.id, txn.id));

            if (txn.orderId) {
                await db
                    .update(orders)
                    .set({ status: 'COMPLETED' })
                    .where(eq(orders.id, txn.orderId));
            }

            logger.info({ transactionCode }, '[PayOS Webhook] Payment COMPLETED');
        } else {
            // ── Payment FAILED/CANCELLED ──
            await db
                .update(transactions)
                .set({ status: 'FAILED' })
                .where(eq(transactions.id, txn.id));

            if (txn.orderId) {
                await db
                    .update(orders)
                    .set({ status: 'FAILED' })
                    .where(eq(orders.id, txn.orderId));
            }

            logger.info({ transactionCode }, '[PayOS Webhook] Payment FAILED');
        }

        // Always return 200 to acknowledge receipt
        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error({ err: error }, '[PayOS Webhook] Error');
        // Return 200 even on error to prevent PayOS from retrying endlessly
        return NextResponse.json({ success: true });
    }
}
