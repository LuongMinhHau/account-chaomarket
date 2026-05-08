import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { db } from '@/lib/db';
import { cartItems } from '@/db/schema';
import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

const deleteItemsSchema = z.object({
    productIds: z.array(z.string()).min(1),
});

export async function DELETE(req: NextRequest) {
    try {
        const token = await getToken({ req });

        if (!token?.id) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { productIds } = deleteItemsSchema.parse(body);

        // Get user's active cart
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

        await db
            .delete(cartItems)
            .where(
                and(
                    eq(cartItems.cartId, cart.id),
                    inArray(cartItems.productId, productIds)
                )
            );

        return NextResponse.json(
            { data: null, message: 'Items removed from cart successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('[Cart Items DELETE] Error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Validation failed' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
