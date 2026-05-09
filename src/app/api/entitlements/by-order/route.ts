import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { db } from '@/lib/db';
import { orders, orderProducts, transactions, products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/entitlements/by-order?orderCode=xxx
 * Returns product entitlements for a completed order.
 * Derives entitlement data from order_products + products.
 */
export async function GET(req: NextRequest) {
    try {
        const token = await getToken({ req });
        if (!token?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const orderCode = req.nextUrl.searchParams.get('orderCode');
        if (!orderCode) {
            return NextResponse.json({ data: [] });
        }

        // Find the transaction by gateway ID (orderCode) to get the orderId
        const [txn] = await db
            .select({ orderId: transactions.orderId })
            .from(transactions)
            .where(
                and(
                    eq(transactions.gatewayTransactionId, orderCode),
                    eq(transactions.userId, token.id as string)
                )
            )
            .limit(1);

        if (!txn?.orderId) {
            return NextResponse.json({ data: [] });
        }

        // Get order products with product details
        const items = await db
            .select({
                orderId: orderProducts.orderId,
                productId: orderProducts.productId,
                durationMonths: orderProducts.durationMonths,
                plan: orderProducts.plan,
                productName: products.name,
                productType: products.type,
                downloadLink: products.downloadLink,
                downloadLabel: products.downloadLabel,
            })
            .from(orderProducts)
            .innerJoin(products, eq(orderProducts.productId, products.id))
            .where(eq(orderProducts.orderId, txn.orderId));

        // Get order creation date for expiry calculation
        const [order] = await db
            .select({ createdAt: orders.createdAt, status: orders.status })
            .from(orders)
            .where(eq(orders.id, txn.orderId))
            .limit(1);

        const entitlements = items.map((item) => {
            const createdAt = new Date(order?.createdAt || Date.now());
            const expiresAt = new Date(createdAt);
            expiresAt.setMonth(expiresAt.getMonth() + (item.durationMonths || 1));

            return {
                id: `${item.orderId}-${item.productId}`,
                durationMonths: item.durationMonths || 1,
                expiresAt: expiresAt.toISOString(),
                status: order?.status === 'COMPLETED' ? 'ACTIVE' : 'PENDING',
                product: {
                    id: item.productId,
                    name: item.productName,
                    downloadLink: item.downloadLink,
                    downloadLabel: item.downloadLabel,
                    type: item.productType,
                },
            };
        });

        return NextResponse.json({ data: entitlements });
    } catch (error) {
        console.error('[Entitlements] Error:', error);
        return NextResponse.json({ data: [] });
    }
}
