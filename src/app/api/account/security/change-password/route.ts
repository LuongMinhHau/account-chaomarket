import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth.config';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { logAuditEvent } from '@/lib/audit-logger';
import { logger, sendToLogtail, logApiEvent } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limiter';
import { z } from 'zod';
import { apiSuccess, apiError, apiUnauthorized, apiRateLimited, apiInternalError, parseBody } from '@/lib/api-response';

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[a-z]/, 'Must contain a lowercase letter')
        .regex(/[A-Z]/, 'Must contain an uppercase letter')
        .regex(/\d/, 'Must contain a number')
        .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
});

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return apiUnauthorized();
    }

    if (!checkRateLimit(`change-pw:${session.user.id}`, 5, 60_000)) {
        return apiRateLimited();
    }

    const parsed = await parseBody(request, changePasswordSchema);
    if (parsed.error) return parsed.error;
    const { currentPassword, newPassword } = parsed.data;

    try {
        // Get user
        const [user] = await db
            .select({ id: users.id, password: users.password })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        if (!user || !user.password) {
            return apiError('NO_PASSWORD', 'OAuth accounts cannot change password');
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return apiError('INVALID_PASSWORD', 'Current password is incorrect');
        }

        // Hash and update
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await db
            .update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, session.user.id));

        logApiEvent('info', 'Password changed', { userId: session.user.id }); logAuditEvent({
            action: 'password_change',
            userId: session.user.id,
            email: session.user.email,
        });

        return apiSuccess({ message: 'Password changed successfully' });
    } catch (error) {
        logger.error({ err: error, userId: session.user.id }, 'Change password error');
        sendToLogtail('error', 'Change password failed', { userId: session.user.id, error: String(error) });
        return apiInternalError('Failed to change password');
    }
}
