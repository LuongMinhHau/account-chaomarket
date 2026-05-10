import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth.config';
import { db } from '@/lib/db';
import { users, otpCodes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendEmail } from '@/lib/brevo';
import { generateId } from '@/utils/generate-id';
import { changeEmailNewOtpEmail, getEmailSubject } from '@/lib/email-templates';
import { getEmailLocale } from '@/lib/get-email-locale';
import { logAuditEvent } from '@/lib/audit-logger';
import { checkAuthRateLimit } from '@/lib/auth-rate-limit';
import { logger, sendToLogtail } from '@/lib/logger';
import { z } from 'zod';

const changeEmailSchema = z.object({
    newEmail: z.string().email('Email không hợp lệ'),
});

import { generateOTP, hashOTP } from '@/lib/otp';

/**
 * POST — Step 1: Send OTP to new email address
 * Body: { newEmail: string }
 */
export async function POST(request: NextRequest) {
    const rateLimitResponse = checkAuthRateLimit(request, 'otp');
    if (rateLimitResponse) return rateLimitResponse;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const parsed = changeEmailSchema.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Email mới là bắt buộc' }, { status: 400 });
        }
        const { newEmail } = parsed.data;

        // Get current user
        const [currentUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if new email is same as current
        if (currentUser.email.toLowerCase() === newEmail.toLowerCase()) {
            return NextResponse.json({ error: 'Email mới phải khác email hiện tại' }, { status: 400 });
        }

        // Check if new email already exists
        const [existingUser] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, newEmail.toLowerCase()))
            .limit(1);

        if (existingUser) {
            return NextResponse.json({ error: 'Email này đã được sử dụng' }, { status: 409 });
        }

        // Generate OTP and save
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        await db.insert(otpCodes).values({
            id: generateId(),
            userId: currentUser.id,
            code: hashOTP(otpCode),
            type: 'change-email',
            expires: expiresAt.toISOString(),
            verified: false,
        });

        // Send OTP to NEW email
        const locale = getEmailLocale(request);
        await sendEmail({
            to: newEmail,
            subject: getEmailSubject('changeEmailNew', locale),
            htmlContent: changeEmailNewOtpEmail(otpCode, locale, currentUser.name ?? undefined),
        });

        logAuditEvent({
            action: 'change_email_otp_sent',
            userId: currentUser.id,
            email: currentUser.email,
            details: { newEmail },
        });

        return NextResponse.json({ message: 'OTP đã được gửi đến email mới' });
    } catch (error) {
        logger.error({ err: error, userId: session.user.id }, 'Change email error');
        sendToLogtail('error', 'Change email failed', { userId: session.user.id, error: String(error) });
        return NextResponse.json({ error: 'Không thể gửi mã xác nhận' }, { status: 500 });
    }
}

/**
 * PUT — Update email (OTP already verified by profile save flow)
 * Body: { newEmail: string }
 */
export async function PUT(request: NextRequest) {
    const rateLimitResponse = checkAuthRateLimit(request, 'otp-verify');
    if (rateLimitResponse) return rateLimitResponse;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const parsed = changeEmailSchema.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json({ error: 'Email mới là bắt buộc' }, { status: 400 });
        }
        const { newEmail } = parsed.data;

        const [currentUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Double-check new email isn't taken (race condition guard)
        const [existingUser] = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, newEmail.toLowerCase()))
            .limit(1);

        if (existingUser) {
            return NextResponse.json({ error: 'Email này đã được sử dụng' }, { status: 409 });
        }

        // Update email
        const oldEmail = currentUser.email;
        await db
            .update(users)
            .set({
                email: newEmail.toLowerCase(),
                emailVerified: new Date().toISOString(),
            })
            .where(eq(users.id, currentUser.id));

        logAuditEvent({
            action: 'email_changed',
            userId: currentUser.id,
            email: oldEmail,
            details: { newEmail: newEmail.toLowerCase() },
        });

        return NextResponse.json({
            message: 'Email đã được cập nhật thành công',
            newEmail: newEmail.toLowerCase(),
        });
    } catch (error) {
        logger.error({ err: error, userId: session.user.id }, 'Verify change email error');
        sendToLogtail('error', 'Verify change email failed', { userId: session.user.id, error: String(error) });
        return NextResponse.json({ error: 'Không thể cập nhật email' }, { status: 500 });
    }
}
