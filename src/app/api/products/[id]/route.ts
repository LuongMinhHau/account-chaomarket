import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/db/schema';
import { eq } from 'drizzle-orm';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/products/[id]
 * Public endpoint to fetch basic product info (name only).
 * Used by the purchase gateway page to display product name.
 */
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Issue 5: Validate UUID format before querying DB
        if (!UUID_REGEX.test(id)) {
            return NextResponse.json(
                { error: 'Invalid product ID format' },
                { status: 400 }
            );
        }

        const product = await db
            .select({
                id: products.id,
                name: products.name,
            })
            .from(products)
            .where(eq(products.id, id))
            .limit(1);

        if (!product.length) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Issue 4: Cache product name for 5 minutes (names rarely change)
        return NextResponse.json(product[0], {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
            },
        });
    } catch {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
