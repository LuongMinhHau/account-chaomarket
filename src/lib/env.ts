import { z } from 'zod';

/**
 * Server-side environment validation — fail-fast at startup.
 *
 * - In production runtime: throws to prevent startup with bad config
 * - In development / build time: warns only (avoids blocking HMR or build)
 *
 * Usage: import '@/lib/env' in instrumentation.ts
 */

// Helper: treat empty strings as undefined
const optionalString = z.preprocess(
    val => (val === '' ? undefined : val),
    z.string().min(1).optional()
);

const serverEnvSchema = z.object({
    // Database (required)
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

    // Auth (required)
    NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
    NEXTAUTH_SECRET: z
        .string()
        .min(
            32,
            'NEXTAUTH_SECRET must be at least 32 characters for production security'
        ),

    // Email (required for OTP/transactional emails)
    BREVO_API_KEY: z
        .string()
        .min(1, 'BREVO_API_KEY is required for email sending'),

    // OAuth (optional — social login may not be configured yet)
    GOOGLE_CLIENT_ID: optionalString,
    GOOGLE_CLIENT_SECRET: optionalString,

    // Optional
    COOKIE_DOMAIN: optionalString,
});

// Only validate on server (not during client-side bundling)
if (typeof window === 'undefined') {
    const parsed = serverEnvSchema.safeParse(process.env);

    if (!parsed.success) {
        const errors = parsed.error.flatten().fieldErrors;
        const formatted = Object.entries(errors)
            .map(([key, msgs]) => `  ✗ ${key}: ${msgs?.join(', ')}`)
            .join('\n');

        console.error(
            `\n❌ Missing or invalid environment variables:\n${formatted}\n` +
                `\nPlease check your .env file.\n`
        );

        // In production runtime, throw to prevent startup with bad config
        if (
            process.env.NODE_ENV === 'production' &&
            process.env.NEXT_RUNTIME === 'nodejs'
        ) {
            throw new Error(
                'Invalid environment variables. See logged errors above.'
            );
        }
    }
}
