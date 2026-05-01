import {
    pgTable,
    uuid,
    text,
    timestamp,
    boolean,
    foreignKey,
    jsonb,
} from 'drizzle-orm/pg-core';
import { InferSelectModel } from 'drizzle-orm';
import { users } from './auth';
import { notificationType } from './enums';

// ── Notifications ──
export const notifications = pgTable(
    'notifications',
    {
        id: uuid().defaultRandom().primaryKey().notNull(),
        userId: uuid().notNull(),
        type: notificationType().default('system').notNull(),
        title: text().notNull(),
        message: text().notNull(),
        isRead: boolean().default(false).notNull(),
        isStarred: boolean().default(false).notNull(),
        metadata: jsonb(),
        createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
    },
    table => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: 'notifications_userId_user_id_fk',
        }).onDelete('cascade'),
    ]
);

export type Notification = InferSelectModel<typeof notifications>;
