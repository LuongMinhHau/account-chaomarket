import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { orders, orderProducts, transactions, cartItems, carts, products } from '@/db/schema';
import { db } from '@/lib/db';
import { ApiResponse } from '@/types/base-response';
import { and, eq, inArray } from 'drizzle-orm';
import { generateOrderCode } from '@/lib/order-code';
import { checkoutSchema } from '@/app/api/carts/checkout/schema';
import payos from '@/lib/payos';

export async function POST(req: NextRequest) {
    try {
        const token = await getToken({ req });
        if (!token?.id) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
                { status: 401 }
            );
        }
        const userId = token.id as string;

        const body = await req.json();
        const parsed = checkoutSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Validation failed' } },
                { status: 400 }
            );
        }

        const { firstName, lastName, email, phoneNumber, cartItemIds } = parsed.data;

        // Get user's active cart
        const [cart] = await db
            .select()
            .from(carts)
            .where(and(eq(carts.userId, userId), eq(carts.isCheckedOut, false)))
            .limit(1);

        if (!cart) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: { code: 'NOT_FOUND', message: 'Cart not found' } },
                { status: 404 }
            );
        }

        // Get selected cart items with product details
        const items = await db
            .select({
                productId: cartItems.productId,
                quantity: cartItems.quantity,
                durationMonths: cartItems.durationMonths,
                plan: cartItems.plan,
                productName: products.name,
                productPrice: products.price,
                productType: products.type,
                productCategory: products.category,
                discountPrice: products.discountPrice,
                isDiscountVisible: products.isDiscountPriceVisible,
            })
            .from(cartItems)
            .innerJoin(products, eq(cartItems.productId, products.id))
            .where(
                and(
                    eq(cartItems.cartId, cart.id),
                    inArray(cartItems.productId, cartItemIds)
                )
            );

        if (items.length === 0) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: { code: 'EMPTY_CART', message: 'No items found in cart' } },
                { status: 400 }
            );
        }

        // Calculate total
        const totalAmount = items.reduce((sum, item) => {
            const price = (item.isDiscountVisible && item.discountPrice)
                ? parseFloat(item.discountPrice)
                : parseFloat(item.productPrice);
            return sum + price * (item.quantity || 1);
        }, 0);

        // Generate order code
        const orderCode = await generateOrderCode('other');

        // Create order
        const [order] = await db.insert(orders).values({
            userId,
            firstName,
            lastName,
            email,
            phoneNumber,
            status: 'PENDING',
        }).returning();

        // Create order products
        await db.insert(orderProducts).values(
            items.map(item => ({
                orderId: order.id,
                productId: item.productId,
                purchasedName: item.productName as { en: string; vi: string },
                originalPrice: item.productPrice,
                purchasedPrice: (item.isDiscountVisible && item.discountPrice)
                    ? item.discountPrice
                    : item.productPrice,
                wasDiscounted: !!(item.isDiscountVisible && item.discountPrice),
                durationMonths: item.durationMonths || 1,
                plan: item.plan || 'free',
            }))
        );

        // Create transaction
        const [transaction] = await db.insert(transactions).values({
            orderId: order.id,
            userId,
            amount: String(totalAmount),
            currency: 'VND',
            status: 'PENDING',
            gatewayTransactionId: String(orderCode),
        }).returning();

        // Create PayOS payment link
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:2000';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const paymentLink = await (payos as any).createPaymentLink({
            orderCode,
            amount: Math.round(totalAmount),
            description: `Chào Market #${orderCode}`.slice(0, 25),
            items: items.map(item => ({
                name: ((item.productName as { vi: string })?.vi || 'Product').slice(0, 25),
                quantity: item.quantity || 1,
                price: Math.round(
                    (item.isDiscountVisible && item.discountPrice)
                        ? parseFloat(item.discountPrice)
                        : parseFloat(item.productPrice)
                ),
            })),
            returnUrl: `${baseUrl}/cart/complete?orderCode=${orderCode}&status=success`,
            cancelUrl: `${baseUrl}/cart/complete?orderCode=${orderCode}&status=cancelled`,
            buyerName: `${firstName} ${lastName}`,
            buyerEmail: email,
            buyerPhone: phoneNumber || undefined,
        });

        return NextResponse.json<ApiResponse<{ checkoutUrl: string; orderCode: number }>>(
            {
                success: true,
                data: {
                    checkoutUrl: paymentLink.checkoutUrl,
                    orderCode,
                    ...transaction,
                },
            }
        );
    } catch (error) {
        console.error('[Checkout] Error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        );
    }
}
