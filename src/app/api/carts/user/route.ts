import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { db } from '@/lib/db';
import { carts } from '@/db/schema';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    try {
        const token = await getToken({ req });

        if (!token?.id) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = token.id as string;

        // Verify user exists
        const userExists = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: { id: true },
        });

        if (!userExists) {
            return NextResponse.json(
                { data: null, message: 'User not found — please sign in again' },
                { status: 200 }
            );
        }

        // Find or create active cart with items + products + pricing tiers
        let cart = await db.query.carts.findFirst({
            where: (c, { eq, and }) =>
                and(eq(c.userId, userId), eq(c.isCheckedOut, false)),
            orderBy: (c, { desc }) => [desc(c.createdAt)],
            with: {
                items: {
                    orderBy: (item, { asc }) => [asc(item.createdAt)],
                    with: {
                        product: {
                            with: {
                                pricingTiers: true,
                            },
                        },
                    },
                },
            },
        });

        if (!cart) {
            const [newCart] = await db
                .insert(carts)
                .values({ userId, isCheckedOut: false })
                .returning();

            cart = { ...newCart, items: [] };
        }

        return NextResponse.json(
            { data: cart, message: 'Cart retrieved successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('[Cart GET] Error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
