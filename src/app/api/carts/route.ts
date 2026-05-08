import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { db } from '@/lib/db';
import { carts, cartItems, products } from '@/db/schema';
import { addProductsToCartSchema } from '@/types/cart/request/add-products-to-cart';
import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const token = await getToken({ req: request });

        if (!token?.id) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = token.id as string;
        const parsed = addProductsToCartSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { message: 'Validation failed', error: parsed.error.issues },
                { status: 400 }
            );
        }

        const productIds = parsed.data.map(item => item.productId);

        const result = await db.transaction(async tx => {
            // Verify products exist
            const existingProducts = await tx
                .select({ id: products.id, stock: products.stock })
                .from(products)
                .where(inArray(products.id, productIds));

            const foundIds = new Set(existingProducts.map(p => p.id));
            const missing = productIds.filter(id => !foundIds.has(id));

            if (missing.length > 0) {
                throw new Error(`Products not found: [${missing.join(', ')}]`);
            }

            // Find or create active cart
            let cart = await tx.query.carts.findFirst({
                where: (c, { eq, and }) =>
                    and(eq(c.userId, userId), eq(c.isCheckedOut, false)),
                orderBy: (c, { desc }) => [desc(c.createdAt)],
            });

            if (!cart) {
                const [newCart] = await tx
                    .insert(carts)
                    .values({ userId })
                    .returning();
                cart = newCart;

                // Insert all items for new cart
                await tx.insert(cartItems).values(
                    parsed.data.map(p => ({
                        cartId: cart!.id,
                        productId: p.productId,
                        quantity: 1,
                        durationMonths: p.durationMonths || 1,
                        plan: p.plan || 'free',
                    }))
                );
            } else {
                // Existing cart — upsert items
                const existingItems = await tx
                    .select()
                    .from(cartItems)
                    .where(eq(cartItems.cartId, cart.id));

                for (const item of parsed.data) {
                    const existing = existingItems.find(
                        e => e.productId === item.productId
                    );

                    if (!existing) {
                        await tx.insert(cartItems).values({
                            cartId: cart.id,
                            productId: item.productId,
                            quantity: 1,
                            durationMonths: item.durationMonths || 1,
                            plan: item.plan || 'free',
                        });
                    } else {
                        await tx
                            .update(cartItems)
                            .set({
                                durationMonths: item.durationMonths || existing.durationMonths || 1,
                                plan: item.plan || existing.plan || 'free',
                            })
                            .where(
                                and(
                                    eq(cartItems.cartId, cart.id),
                                    eq(cartItems.productId, item.productId)
                                )
                            );
                    }
                }
            }

            return { data: cart.id, message: 'Products added to cart' };
        });

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('[Cart POST] Error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: 'Validation failed' },
                { status: 400 }
            );
        }

        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ message }, { status: 500 });
    }
}
