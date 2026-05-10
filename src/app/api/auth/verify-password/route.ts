import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { checkAuthRateLimit } from '@/lib/auth-rate-limit';
import { logger, sendToLogtail } from '@/lib/logger';
import { z } from 'zod';

const verifyPasswordSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

/**
 * POST /api/auth/verify-password
 * Verifies a user's password WITHOUT creating a session.
 * Used for login verification flow where OTP is required after password check.
 */
export async function POST(request: NextRequest) {
    const rateLimitResponse = checkAuthRateLimit(request, 'verify-password');
    if (rateLimitResponse) return rateLimitResponse;

    try {
        const parsed = verifyPasswordSchema.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json({ valid: false }, { status: 400 });
        }
        const { email, password } = parsed.data;

        const [user] = await db
            .select({ id: users.id, password: users.password })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (!user?.password) {
            return NextResponse.json({ valid: false }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return NextResponse.json({ valid: false }, { status: 401 });
        }

        return NextResponse.json({ valid: true });
    } catch (error) {
        logger.error({ err: error }, 'Verify password error');
        sendToLogtail('error', 'Verify password failed', { error: String(error) });
        return NextResponse.json({ valid: false }, { status: 500 });
    }
}
