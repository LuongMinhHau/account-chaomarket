import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth.config';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { logAuditEvent } from '@/lib/audit-logger';
import { logger } from '@/lib/logger';

/**
 * GET  — Check login verification status
 * PUT  — Toggle login verification on/off
 */

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const [user] = await db
            .select({ loginVerification: users.loginVerification })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        return NextResponse.json({ enabled: user?.loginVerification ?? false });
    } catch (error) {
        logger.error({ err: error }, 'Login verification GET error');
        return NextResponse.json({ message: 'Internal error' }, { status: 500 });
    }
}

export async function PUT() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Get current state and toggle
        const [user] = await db
            .select({ loginVerification: users.loginVerification })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        const newValue = !(user?.loginVerification ?? false);

        await db
            .update(users)
            .set({ loginVerification: newValue })
            .where(eq(users.id, session.user.id));

        logAuditEvent({
            action: newValue ? 'login_verification_enabled' : 'login_verification_disabled',
            userId: session.user.id,
            email: session.user.email,
        });

        return NextResponse.json({ enabled: newValue });
    } catch (error) {
        logger.error({ err: error }, 'Login verification PUT error');
        return NextResponse.json({ message: 'Internal error' }, { status: 500 });
    }
}
