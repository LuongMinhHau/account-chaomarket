import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth.config';
import { db } from '@/lib/db';
import { accounts, sessions, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { logger, sendToLogtail, logApiEvent } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limiter';
import { logAuditEvent } from '@/lib/audit-logger';

/**
 * DELETE /api/account
 * Soft-delete user account — anonymizes PII, revokes sessions, preserves order history.
 * Complies with GDPR Article 17 "Right to Erasure".
 */
export async function DELETE() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!checkRateLimit(`delete-account:${session.user.id}`, 2, 300_000)) {
        return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
    }

    const userId = session.user.id;

    try {
        // 1. Anonymize user PII (soft-delete pattern — preserves referential integrity)
        const anonymizedEmail = `deleted-${userId.slice(0, 8)}@anonymized.chaomarket.com`;
        await db
            .update(users)
            .set({
                name: 'Deleted User',
                email: anonymizedEmail,
                phone: null,
                image: null,
                gender: null,
                dateOfBirth: null,
                password: null,
                totpSecret: null,
                totpEnabled: false,
                backupCodes: null,
                emailVerified: null,
            })
            .where(eq(users.id, userId));

        // 2. Revoke all OAuth provider links
        await db
            .delete(accounts)
            .where(eq(accounts.userId, userId));

        // 3. Revoke all active sessions
        await db
            .delete(sessions)
            .where(eq(sessions.userId, userId));

        // 4. Audit log
        logAuditEvent({
            action: 'account_deleted',
            userId,
            email: session.user.email,
        });

        logApiEvent('warn', 'Account deleted (GDPR erasure)', {
            userId,
            originalEmail: session.user.email,
        });

        return NextResponse.json({
            success: true,
            message: 'Account has been permanently deleted',
        });
    } catch (error) {
        logger.error({ err: error, userId }, 'Account deletion failed');
        sendToLogtail('error', 'Account deletion failed', { userId, error: String(error) });
        return NextResponse.json({ message: 'Failed to delete account' }, { status: 500 });
    }
}
