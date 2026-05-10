import { z } from 'zod';

/**
 * Enterprise Env Validator — fail-fast at startup if required vars are missing.
 *
 * Usage:
 *   import { env } from '@/lib/env';
 *   env.DATABASE_URL   // ✅ typed, validated
 *
 * Replaces all `process.env.X!` non-null assertions with safe, validated access.
 */
const serverSchema = z.object({
    // ── Database ──
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    ADMIN_DATABASE_URL: z.string().optional(),

    // ── NextAuth ──
    NEXTAUTH_URL: z.string().min(1, 'NEXTAUTH_URL is required'),
    NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),

    // ── Cookie ──
    COOKIE_DOMAIN: z.string().optional(),

    // ── Google OAuth ──
    GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
    GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),

    // ── Brevo Email ──
    BREVO_API_KEY: z.string().min(1, 'BREVO_API_KEY is required'),

    // ── PayOS ──
    PAYOS_CLIENT_ID: z.string().min(1, 'PAYOS_CLIENT_ID is required'),
    PAYOS_API_KEY: z.string().min(1, 'PAYOS_API_KEY is required'),
    PAYOS_CHECKSUM_KEY: z.string().min(1, 'PAYOS_CHECKSUM_KEY is required'),

    // ── Cloudflare R2 ──
    R2_ENDPOINT: z.string().optional(),
    R2_ACCESS_KEY_ID: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),
    R2_PUBLIC_URL: z.string().optional(),

    // ── License ──
    LICENSE_API_SECRET: z.string().optional(),

    // ── Logging ──
    LOGTAIL_SOURCE_TOKEN: z.string().optional(),
    LOG_LEVEL: z.string().optional(),

    // ── Sentry ──
    SENTRY_AUTH_TOKEN: z.string().optional(),

    // ── Runtime ──
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof serverSchema>;

/**
 * Validated environment — parsed once at module load.
 * Will throw a descriptive error if any required var is missing.
 */
function validateEnv(): Env {
    const parsed = serverSchema.safeParse(process.env);

    if (!parsed.success) {
        const formatted = parsed.error.issues
            .map(issue => `  ✗ ${issue.path.join('.')}: ${issue.message}`)
            .join('\n');

        console.error(
            `\n❌ Invalid environment variables:\n${formatted}\n`
        );

        throw new Error('Invalid environment variables — see above for details.');
    }

    return parsed.data;
}

export const env = validateEnv();
