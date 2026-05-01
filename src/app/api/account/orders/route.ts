import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth.config';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

/**
 * Fetch user's order history (transactions) from the shared DB.
 * Uses raw SQL since the transaction/order tables belong to the Web schema.
 */
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await db.execute(sql`
            SELECT 
                t.id,
                t.status,
                t.amount,
                t."createdAt",
                t."orderId",
                t."consultationId",
                t."paymentGateway",
                t."gatewayTransactionId"
            FROM transaction t
            WHERE t."userId" = ${session.user.id}
            ORDER BY t."createdAt" DESC
            LIMIT 50
        `);

        return NextResponse.json({ data: result.rows || [] });
    } catch {
        // Table may not exist in this DB instance
        return NextResponse.json({ data: [] });
    }
}
