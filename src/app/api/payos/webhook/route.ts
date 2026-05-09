import { NextRequest, NextResponse } from 'next/server';
import { PayOS, Webhooks } from '@payos/node';
import { db } from '@/lib/db';
import { orders, transactions } from '@/db/schema';
import { eq } from 'drizzle-orm';

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
        const payosClient = new PayOS({
            clientId: process.env.PAYOS_CLIENT_ID!,
            apiKey: process.env.PAYOS_API_KEY!,
            checksumKey: process.env.PAYOS_CHECKSUM_KEY!,
        });

        const webhooks = new Webhooks(payosClient);
        let webhookData;
        try {
            webhookData = await webhooks.verify(body);
        } catch {
            console.error('[PayOS Webhook] Invalid signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const orderCode = String(webhookData.orderCode);
        const isSuccess = body.code === '00' || body.success;

        // Find transaction by gateway ID
        const [txn] = await db
            .select({ id: transactions.id, orderId: transactions.orderId })
            .from(transactions)
            .where(eq(transactions.gatewayTransactionId, orderCode))
            .limit(1);

        if (!txn) {
            console.warn(`[PayOS Webhook] No transaction found for orderCode: ${orderCode}`);
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

            console.log(`[PayOS Webhook] ✅ Payment COMPLETED for orderCode: ${orderCode}`);
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

            console.log(`[PayOS Webhook] ❌ Payment FAILED for orderCode: ${orderCode}`);
        }

        // Always return 200 to acknowledge receipt
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[PayOS Webhook] Error:', error);
        // Return 200 even on error to prevent PayOS from retrying endlessly
        return NextResponse.json({ success: true });
    }
}
