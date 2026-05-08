import { pgEnum } from 'drizzle-orm/pg-core';

// ── User enums ──
export const userRole = pgEnum('user_role', ['ADMIN', 'USER']);
export const userStatus = pgEnum('user_status', ['ACTIVE', 'INACTIVE', 'BANNED']);

// ── Notification enums ──
export const notificationType = pgEnum('notification_type', ['security', 'system', 'account', 'order']);

// ── Commerce enums ──
export const orderStatus = pgEnum('order_status', ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']);
export const transactionStatus = pgEnum('transaction_status', ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']);
