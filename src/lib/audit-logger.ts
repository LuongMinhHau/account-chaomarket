import { headers } from 'next/headers';

export interface AuditEvent {
    action: 'register' | 'login' | 'logout' | 'password_reset' |
            'otp_send' | 'otp_verify' | 'profile_update' | 'password_reset_request' | string;
    userId?: string | null;
    email?: string | null;
    details?: Record<string, unknown>;
}

/**
 * Log a user activity audit event.
 * Non-blocking — never throws.
 */
export async function logAuditEvent(event: AuditEvent): Promise<void> {
    try {
        const headersList = await headers();
        const ipAddress =
            headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            headersList.get('x-real-ip') ||
            'unknown';

        const entry = {
            timestamp: new Date().toISOString(),
            action: event.action,
            userId: event.userId || null,
            email: event.email || null,
            ipAddress,
            details: event.details || null,
        };

        console.log(`[AUDIT] ${event.action}`, JSON.stringify(entry));
    } catch {
        // Audit logging must never break the main flow
    }
}
