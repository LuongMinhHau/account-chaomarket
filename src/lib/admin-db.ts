import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { pgTable, varchar, text, timestamp } from 'drizzle-orm/pg-core';

// ── Admin brand_settings schema (read-only mirror) ──
export const brandSettings = pgTable('brand_settings', {
    key: varchar('key', { length: 100 }).primaryKey(),
    value: text('value').notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    updatedBy: varchar('updated_by', { length: 255 }),
});

const adminSchema = { brandSettings };

// ── Lazy singleton ──
let _db: NodePgDatabase<typeof adminSchema> | null = null;

function getAdminDb() {
    if (!_db) {
        const url = process.env.ADMIN_DATABASE_URL;
        if (!url) {
            throw new Error(
                'ADMIN_DATABASE_URL is not set. ' +
                'Add it to .env.local to connect to the admin database.',
            );
        }
        const pool = new Pool({ connectionString: url });
        _db = drizzle(pool, { schema: adminSchema });
    }
    return _db;
}

export { getAdminDb as adminDb };
