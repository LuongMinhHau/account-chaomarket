import {
    pgTable,
    uuid,
    text,
    timestamp,
    boolean,
    foreignKey,
} from 'drizzle-orm/pg-core';
import { InferSelectModel } from 'drizzle-orm';
import { users } from './auth';

// ── User Sessions (Device Tracking) ──
export const userDevices = pgTable(
    'user_devices',
    {
        id: uuid().defaultRandom().primaryKey().notNull(),
        userId: uuid().notNull(),
        deviceName: text(),
        deviceType: text(), // 'desktop' | 'mobile' | 'tablet'
        browser: text(),
        os: text(),
        ipAddress: text(),
        location: text(),
        lastActiveAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
        createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
        isCurrent: boolean().default(false).notNull(),
    },
    table => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: 'user_devices_userId_user_id_fk',
        }).onDelete('cascade'),
    ]
);

export type UserDevice = InferSelectModel<typeof userDevices>;
