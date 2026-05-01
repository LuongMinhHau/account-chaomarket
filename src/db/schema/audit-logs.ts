import {
    pgTable,
    uuid,
    text,
    timestamp,
    foreignKey,
    jsonb,
} from 'drizzle-orm/pg-core';
import { InferSelectModel } from 'drizzle-orm';
import { users } from './auth';

// ── Audit Logs ──
export const auditLogs = pgTable(
    'audit_logs',
    {
        id: uuid().defaultRandom().primaryKey().notNull(),
        userId: uuid(),
        action: text().notNull(),
        ipAddress: text(),
        userAgent: text(),
        metadata: jsonb(),
        createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
    },
    table => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: 'audit_logs_userId_user_id_fk',
        }).onDelete('set null'),
    ]
);

export type AuditLog = InferSelectModel<typeof auditLogs>;
