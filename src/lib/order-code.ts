import { db } from '@/lib/db';
import { transactions } from '@/db/schema';
import { and, gte, lt, sql } from 'drizzle-orm';

// Re-export formatOrderCode from the shared (client-safe) module
export { formatOrderCode } from '@/lib/format-order-code';

/**
 * Order code format: TDDMMYYDDD (10 digits)
 *
 * T:      1 (Trading Tools & Data) | 2 (AI & Software) | 3 (Custom Solutions) | 4 (News) | 5 (Other)
 * DDMMYY: date (day-month-year)
 * DDD:    daily sequential number (001–999)
 *
 * Numeric (for PayOS): TDDMMYYDDD  (10 digits)
 * Display (for UI):    #TDDMMYYDDD
 */

export type OrderType = 'tradingToolsAndData' | 'aiAndSoftware' | 'customSolutions' | 'news' | 'other';

const TYPE_PREFIX: Record<OrderType, number> = {
    tradingToolsAndData: 1,
    aiAndSoftware: 2,
    customSolutions: 3,
    news: 4,
    other: 5,
};

/**
 * Generate a new order code in format TDDMMYYDDD.
 * Queries the DB to determine the daily sequential number.
 */
export async function generateOrderCode(
    type: OrderType,
): Promise<number> {
    const now = new Date();
    const t = TYPE_PREFIX[type];
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    const dateStr = `${dd}${mm}${yy}`; // DDMMYY

    // Count today's orders to get daily sequential
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(transactions)
        .where(
            and(
                gte(transactions.createdAt, startOfDay.toISOString()),
                lt(transactions.createdAt, endOfDay.toISOString()),
            ),
        );

    const dailyCount = Number(result[0]?.count ?? 0) + 1;
    const ddd = String(dailyCount).padStart(3, '0');

    return Number(`${t}${dateStr}${ddd}`);
}
