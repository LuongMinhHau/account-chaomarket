import {
    pgTable,
    uuid,
    text,
    timestamp,
    boolean,
    jsonb,
    integer,
    primaryKey,
    numeric,
    index,
} from 'drizzle-orm/pg-core';
import { orderStatus, transactionStatus } from './enums';
import { users } from './auth';

// ── Products (services/plans from all Chào Market platforms) ──
export const products = pgTable('product', {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: jsonb().$type<{ en: string; vi: string }>().notNull(),
    type: text().notNull(),
    category: text().notNull().default('general'),
    marketType: text(),
    shortDescription: jsonb().$type<{ en: string; vi: string }>(),
    description: jsonb().$type<{ en: string; vi: string }>(),
    resource: text(),
    instructionLink: text(),
    downloadLabel: jsonb().$type<{ en?: string; vi?: string }>().default({ en: 'Link', vi: 'Link' }),
    downloadLink: text(),
    price: numeric('price', { precision: 19, scale: 4 }).notNull().default('0'),
    discountPrice: numeric('discount_price', { precision: 19, scale: 4 }),
    isDiscountPriceVisible: boolean().default(false).notNull(),
    imageUrl: text(),
    pinLabel: text(),
    views: integer().default(0).notNull(),
    stock: integer().default(999),
    courseDuration: jsonb().$type<{ en?: string; vi?: string }>(),
    maxDevices: integer('max_devices').default(2).notNull(),
    createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull().$onUpdate(() => new Date().toISOString()),
    // Source platform: news, trading, thuexe, etc.
    source: text().default('trading'),
});

// ── Carts ──
export const carts = pgTable('cart', {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid()
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    isCheckedOut: boolean().default(false).notNull(),
    createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull().$onUpdate(() => new Date().toISOString()),
}, (table) => [
    index('cart_user_idx').using('btree', table.userId),
]);

// ── Cart Items ──
export const cartItems = pgTable(
    'cart_item',
    {
        cartId: uuid()
            .notNull()
            .references(() => carts.id, { onDelete: 'cascade' }),
        productId: uuid()
            .notNull()
            .references(() => products.id, { onDelete: 'cascade' }),
        quantity: integer().notNull().default(1),
        durationMonths: integer().default(1),
        plan: text().default('free'),
        createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
    },
    table => [primaryKey({ columns: [table.cartId, table.productId] })]
);

// ── Orders ──
export const orders = pgTable('order', {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid()
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    firstName: text().notNull(),
    lastName: text().notNull(),
    email: text().notNull(),
    phoneNumber: text().notNull(),
    status: orderStatus().default('PENDING').notNull(),
    createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull().$onUpdate(() => new Date().toISOString()),
}, (table) => [
    index('order_user_idx').using('btree', table.userId),
    index('order_status_idx').using('btree', table.status),
    index('order_created_idx').using('btree', table.createdAt),
]);

// ── Order Products (junction) ──
export const orderProducts = pgTable(
    'order_product',
    {
        orderId: uuid()
            .notNull()
            .references(() => orders.id, { onDelete: 'cascade' }),
        productId: uuid()
            .notNull()
            .references(() => products.id, { onDelete: 'restrict' }),
        purchasedName: jsonb().$type<{ en: string; vi: string }>(),
        originalPrice: numeric('original_price', { precision: 19, scale: 4 }),
        purchasedPrice: numeric('purchased_price', { precision: 19, scale: 4 }),
        wasDiscounted: boolean().default(false),
        durationMonths: integer().default(1),
        plan: text().default('free'),
    },
    table => [
        primaryKey({ columns: [table.orderId, table.productId] }),
    ]
);

// ── Transactions ──
export const transactions = pgTable('transaction', {
    id: uuid().defaultRandom().primaryKey().notNull(),
    consultationId: uuid(),
    orderId: uuid()
        .references(() => orders.id, { onDelete: 'cascade' }),
    userId: uuid().references(() => users.id, { onDelete: 'set null' }),
    amount: numeric('amount', { precision: 19, scale: 4 }).notNull(),
    currency: text().default('VND').notNull(),
    status: transactionStatus().default('PENDING').notNull(),
    paymentGateway: text(),
    gatewayTransactionId: text(),
    createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull().$onUpdate(() => new Date().toISOString()),
}, (table) => [
    index('transaction_user_idx').using('btree', table.userId),
    index('transaction_order_idx').using('btree', table.orderId),
    index('transaction_status_idx').using('btree', table.status),
    index('transaction_created_idx').using('btree', table.createdAt),
]);

// ── Pricing Tiers ──
export const pricingTiers = pgTable('pricing_tier', {
    id: uuid().defaultRandom().primaryKey().notNull(),
    productId: uuid()
        .notNull()
        .references(() => products.id, { onDelete: 'cascade' }),
    tierName: text('tier_name').default('default').notNull(),
    durationMonths: integer().notNull(),
    price: numeric('price', { precision: 19, scale: 4 }).notNull(),
    discountPrice: numeric('discount_price', { precision: 19, scale: 4 }),
    createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});
