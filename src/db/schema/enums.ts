import { pgEnum } from 'drizzle-orm/pg-core';

// ── User enums (subset from ChaoMarket Web — only auth-related) ──
export const userRole = pgEnum('user_role', ['ADMIN', 'USER']);
export const userStatus = pgEnum('user_status', ['ACTIVE', 'INACTIVE', 'BANNED']);
