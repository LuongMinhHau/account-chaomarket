import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { db } from '@/lib/db';
import { cartItems } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

const updateDurationSchema = z.object({
    productId: z.string().uuid(),
    durationMonths: z.number().int().positive(),
});

export async function PATCH(req: NextRequest) {
    try {
        const token = await getToken({ req });
        if (!token?.id) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { productId, durationMonths } = updateDurationSchema.parse(body);

        // Find user's active cart
        const cart = await db.query.carts.findFirst({
            where: (c, { eq, and }) =>
                and(eq(c.userId, token.id as string), eq(c.isCheckedOut, false)),
            orderBy: (c, { desc }) => [desc(c.createdAt)],
        });

        if (!cart) {
            return NextResponse.json(
                { message: 'Cart not found' },
                { status: 404 }
            );
        }

        // Validate duration exists in pricing tiers
        const tier = await db.query.pricingTiers.findFirst({
            where: (pt, { eq, and }) =>
                and(
                    eq(pt.productId, productId),
                    eq(pt.durationMonths, durationMonths),
                ),
        });

        if (!tier) {
            return NextResponse.json(
                { message: `Duration ${durationMonths} months not available` },
                { status: 400 }
            );
        }

        // Update the cart item
        await db
            .update(cartItems)
            .set({ durationMonths })
            .where(
                and(
                    eq(cartItems.cartId, cart.id),
                    eq(cartItems.productId, productId),
                ),
            );

        return NextResponse.json({
            data: { productId, durationMonths, price: tier.price, discountPrice: tier.discountPrice },
            message: 'Duration updated successfully',
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
        }
        console.error('[Duration PATCH] Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
