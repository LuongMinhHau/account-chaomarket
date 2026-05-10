import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { orders, orderProducts, transactions, products, users } from '@/db/schema';
import { db } from '@/lib/db';
import { ApiResponse } from '@/types/base-response';
import { eq } from 'drizzle-orm';
import { generateTransactionCode } from '@/lib/transaction-code';
import { PaymentRequests } from '@payos/node';
import payos from '@/lib/payos';
import { logger } from '@/lib/logger';
import { env } from '@/lib/env';
import { z } from 'zod';
import QRCode from 'qrcode';
import { checkRateLimit } from '@/lib/rate-limiter';

const directPurchaseSchema = z.object({
    productId: z.string().uuid('Invalid product ID'),
    plan: z.string().default('free'),
    durationMonths: z.number().int().min(1).default(1),
});

/**
 * POST /api/purchase
 * Direct purchase — bypasses cart, creates order + payment in one step.
 * Used by the /purchase gateway for "Buy Now" flow from external platforms.
 */
export async function POST(req: NextRequest) {
    try {
        const token = await getToken({ req });
        if (!token?.id) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
                { status: 401 }
            );
        }

        if (!checkRateLimit(`purchase:${token.id}`, 5, 60_000)) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
                { status: 429 }
            );
        }
        const userId = token.id as string;

        const body = await req.json();
        const parsed = directPurchaseSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Validation failed' } },
                { status: 400 }
            );
        }

        const { productId, plan, durationMonths } = parsed.data;

        // Get product
        const [product] = await db
            .select()
            .from(products)
            .where(eq(products.id, productId))
            .limit(1);

        if (!product) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } },
                { status: 404 }
            );
        }

        // Get user info for buyer details
        const [user] = await db
            .select({
                name: users.name,
                email: users.email,
                phone: users.phone,
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!user) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
                { status: 404 }
            );
        }

        // Calculate price
        const price = (product.isDiscountPriceVisible && product.discountPrice)
            ? parseFloat(product.discountPrice)
            : parseFloat(product.price);

        const totalAmount = price * 1; // quantity = 1 for direct purchase

        // Generate transaction code (used as PayOS orderCode)
        const transactionCode = await generateTransactionCode('other');

        // Create order
        const [order] = await db.insert(orders).values({
            userId,
            firstName: user.name?.split(' ')[0] || '',
            lastName: user.name?.split(' ').slice(1).join(' ') || '',
            email: user.email,
            phoneNumber: user.phone || '',
            status: 'PENDING',
        }).returning();

        // Create order product
        await db.insert(orderProducts).values({
            orderId: order.id,
            productId: product.id,
            purchasedName: product.name,
            originalPrice: product.price,
            purchasedPrice: (product.isDiscountPriceVisible && product.discountPrice)
                ? product.discountPrice
                : product.price,
            wasDiscounted: !!(product.isDiscountPriceVisible && product.discountPrice),
            durationMonths,
            plan,
        });

        // Create transaction
        await db.insert(transactions).values({
            orderId: order.id,
            userId,
            amount: String(totalAmount),
            currency: 'VND',
            status: 'PENDING',
            gatewayTransactionId: String(transactionCode),
        }).returning();

        // Create PayOS payment link
        const baseUrl = env.NEXTAUTH_URL;
        const productName = ((product.name as { vi: string })?.vi || 'Product').slice(0, 25);

        const paymentRequests = new PaymentRequests(payos);
        const paymentLink = await paymentRequests.create({
            orderCode: transactionCode, // PayOS requires this field name
            amount: Math.round(totalAmount),
            description: `Chao Market ${transactionCode}`.slice(0, 25),
            items: [{
                name: productName,
                quantity: 1,
                price: Math.round(price),
            }],
            returnUrl: `${baseUrl}/checkout/confirmation?transactionCode=${transactionCode}&status=success`,
            cancelUrl: `${baseUrl}/checkout/confirmation?transactionCode=${transactionCode}&status=cancelled`,
            buyerName: user.name || 'Customer',
            buyerEmail: user.email,
            buyerPhone: user.phone || undefined,
        });

        return NextResponse.json<ApiResponse<{
            checkoutUrl: string;
            orderCode: number; // PayOS field name
            qrCode: string;
            bin: string;
            accountNumber: string;
            accountName: string;
            amount: number;
            description: string;
            expiredAt: string;
            product: {
                name: Record<string, string>;
                price: number;
                plan: string;
                durationMonths: number;
            };
        }>>(
            {
                success: true,
                data: {
                    checkoutUrl: paymentLink.checkoutUrl,
                    orderCode: transactionCode, // PayOS field name
                    qrCode: await QRCode.toDataURL(paymentLink.qrCode, { width: 300, margin: 2 }),
                    bin: paymentLink.bin,
                    accountNumber: paymentLink.accountNumber,
                    accountName: paymentLink.accountName,
                    amount: Math.round(totalAmount),
                    description: paymentLink.description,
                    expiredAt: paymentLink.expiredAt ? String(paymentLink.expiredAt) : '',
                    product: {
                        name: product.name as Record<string, string>,
                        price: Math.round(price),
                        plan,
                        durationMonths,
                    },
                },
            }
        );
    } catch (error) {
        logger.error({ err: error }, '[Direct Purchase] Error');
        return NextResponse.json<ApiResponse>(
            { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
            { status: 500 }
        );
    }
}
