import { pgEnum } from 'drizzle-orm/pg-core';

// ── User enums ──
export const userRole = pgEnum('user_role', ['ADMIN', 'USER']);
export const userStatus = pgEnum('user_status', ['ACTIVE', 'INACTIVE', 'BANNED']);

// ── Notification enums ──
export const notificationType = pgEnum('notification_type', ['security', 'system', 'account', 'order']);
