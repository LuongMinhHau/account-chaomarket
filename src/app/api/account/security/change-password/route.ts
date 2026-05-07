import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth.config';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { logAuditEvent } from '@/lib/audit-logger';
import { logger, sendToLogtail } from '@/lib/logger';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { message: 'Current password and new password are required' },
                { status: 400 }
            );
        }

        // Validate new password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return NextResponse.json(
                { message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' },
                { status: 400 }
            );
        }

        // Get user
        const [user] = await db
            .select({ id: users.id, password: users.password })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        if (!user || !user.password) {
            return NextResponse.json(
                { message: 'OAuth accounts cannot change password' },
                { status: 400 }
            );
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return NextResponse.json(
                { message: 'Current password is incorrect' },
                { status: 400 }
            );
        }

        // Hash and update
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await db
            .update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, session.user.id));

        logAuditEvent({
            action: 'password_change',
            userId: session.user.id,
            email: session.user.email,
        });

        return NextResponse.json({ message: 'Password changed successfully' });
    } catch (error) {
        logger.error({ err: error, userId: session.user.id }, 'Change password error');
        sendToLogtail('error', 'Change password failed', { userId: session.user.id, error: String(error) });
        return NextResponse.json({ message: 'Failed to change password' }, { status: 500 });
    }
}
