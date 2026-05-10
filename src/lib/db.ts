import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/db/schema';
import { env } from '@/lib/env';

const isProduction = env.NODE_ENV === 'production';

const poolConfig = {
    connectionString: env.DATABASE_URL,
    max: isProduction ? 10 : 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
};

// Global singleton to prevent connection leaks during Next.js hot reload
const globalForDb = globalThis as unknown as {
    pool: Pool | undefined;
};

const pool = globalForDb.pool ?? new Pool(poolConfig);

if (!isProduction) {
    globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });
