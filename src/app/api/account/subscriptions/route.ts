import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth.config';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

/**
 * Fetch user's subscriptions (entitlements) from the shared DB.
 * Uses raw SQL since the entitlement/product tables belong to the Web schema.
 */
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await db.execute(sql`
            SELECT 
                e.id,
                e."productId",
                e.plan,
                e."durationMonths",
                e.status,
                e."activatedAt",
                e."expiresAt",
                p.name as "productName",
                p.category as "productType"
            FROM entitlement e
            LEFT JOIN product p ON e."productId" = p.id
            WHERE e."userId" = ${session.user.id}
            ORDER BY e."activatedAt" DESC
            LIMIT 20
        `);

        return NextResponse.json({ data: result.rows || [] });
    } catch {
        // Table may not exist in this DB instance
        return NextResponse.json({ data: [] });
    }
}
