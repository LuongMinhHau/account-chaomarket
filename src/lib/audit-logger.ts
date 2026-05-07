import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { auditLogs } from '@/db/schema';

export interface AuditEvent {
    action: 'register' | 'login' | 'logout' | 'password_reset' |
            'otp_send' | 'otp_verify' | 'profile_update' | 'password_reset_request' | string;
    userId?: string | null;
    email?: string | null;
    details?: Record<string, unknown>;
    meta?: Record<string, unknown>;
}

/**
 * Log a user activity audit event.
 * Writes to the audit_logs DB table. Non-blocking — never throws.
 */
export async function logAuditEvent(event: AuditEvent): Promise<void> {
    try {
        const headersList = await headers();
        const ipAddress =
            headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            headersList.get('x-real-ip') ||
            'unknown';

        await db.insert(auditLogs).values({
            userId: event.userId || null,
            action: event.action,
            ipAddress,
            metadata: event.details || event.meta || null,
        });
    } catch {
        // Audit logging must never break the main flow
    }
}
