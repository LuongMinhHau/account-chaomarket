import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';
const LOGTAIL_TOKEN = process.env.LOGTAIL_SOURCE_TOKEN;
const LOGTAIL_URL = 'https://s2399290.eu-fsn-3.betterstackdata.com';

/**
 * Structured Logger for Chào Account
 *
 * - Dev: Human-readable colorized output (pino-pretty)
 * - Prod: JSON structured logs + Better Stack (Logtail) forwarding
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.info({ orderId }, 'Order created');
 *   logger.error({ err, userId }, 'Payment failed');
 */
export const logger = pino({
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
    ...(isProduction
        ? {
            // Production: structured JSON
            formatters: {
                level(label: string) {
                    return { level: label };
                },
            },
            timestamp: pino.stdTimeFunctions.isoTime,
        }
        : {
            // Development: human-readable
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'HH:MM:ss.l',
                    ignore: 'pid,hostname',
                    singleLine: false,
                },
            },
        }),
    base: {
        service: 'account-chaomarket',
        ...(isProduction ? { env: 'production' } : {}),
    },
});

/**
 * Send log to Better Stack (Logtail) via HTTP.
 * Non-blocking, fire-and-forget.
 */
export function sendToLogtail(level: string, message: string, meta?: Record<string, unknown>) {
    if (!LOGTAIL_TOKEN) return;

    fetch(LOGTAIL_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${LOGTAIL_TOKEN}`,
        },
        body: JSON.stringify({
            dt: new Date().toISOString(),
            level,
            message,
            service: 'account-chaomarket',
            ...meta,
        }),
    }).catch(() => {
        // Silent fail — don't crash app for logging
    });
}

/**
 * Create a child logger with additional context.
 * Useful for request-scoped logging.
 *
 * @example
 *   const log = createChildLogger({ requestId: 'abc-123', route: '/api/checkout' });
 *   log.info('Processing checkout');
 */
export function createChildLogger(bindings: Record<string, unknown>) {
    return logger.child(bindings);
}
