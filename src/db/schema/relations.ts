import { relations } from 'drizzle-orm';
import {
    carts, cartItems, products, orders, orderProducts, transactions, pricingTiers,
} from './commerce';
import { users } from './auth';

// ── Commerce Relations ──

export const productRelations = relations(products, ({ many }) => ({
    cartItems: many(cartItems),
    pricingTiers: many(pricingTiers),
    orderProducts: many(orderProducts),
}));

export const cartRelations = relations(carts, ({ one, many }) => ({
    user: one(users, { fields: [carts.userId], references: [users.id] }),
    items: many(cartItems),
}));

export const cartItemRelations = relations(cartItems, ({ one }) => ({
    cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
    product: one(products, {
        fields: [cartItems.productId],
        references: [products.id],
    }),
}));

export const orderRelations = relations(orders, ({ one, many }) => ({
    user: one(users, { fields: [orders.userId], references: [users.id] }),
    orderProducts: many(orderProducts),
    transactions: many(transactions),
}));

export const orderProductRelations = relations(orderProducts, ({ one }) => ({
    order: one(orders, { fields: [orderProducts.orderId], references: [orders.id] }),
    product: one(products, {
        fields: [orderProducts.productId],
        references: [products.id],
    }),
}));

export const transactionRelations = relations(transactions, ({ one }) => ({
    order: one(orders, {
        fields: [transactions.orderId],
        references: [orders.id],
    }),
    user: one(users, {
        fields: [transactions.userId],
        references: [users.id],
    }),
}));

export const pricingTierRelations = relations(pricingTiers, ({ one }) => ({
    product: one(products, {
        fields: [pricingTiers.productId],
        references: [products.id],
    }),
}));
