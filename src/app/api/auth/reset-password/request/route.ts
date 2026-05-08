import { NextRequest, NextResponse } from 'next/server';
import { randomInt, createHash } from 'crypto';
import { db } from '@/lib/db';
import { users, otpCodes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendEmail } from '@/lib/brevo';
import { generateId } from '@/utils/generate-id';
import { BaseResponse } from '@/types/base-response';
import {
    RESET_PASSWORD_ACTION,
    OTP_TYPE,
} from '@/app/api/auth/reset-password/constants';
import {
    emailVerificationOtpEmail,
    resetPasswordOtpEmail,
    getEmailSubject,
} from '@/lib/email-templates';
import { getEmailLocale } from '@/lib/get-email-locale';
import { checkAuthRateLimit } from '@/lib/auth-rate-limit';
import { logAuditEvent } from '@/lib/audit-logger';
import { logger, sendToLogtail } from '@/lib/logger';

// Generate random 6-digit OTP using cryptographically secure randomness
function generateOTP(): string {
    return randomInt(100000, 1000000).toString();
}

// Hash OTP before storing
function hashOTP(otp: string): string {
    return createHash('sha256').update(otp).digest('hex');
}

// Response types
export interface RequestResetPasswordData {
    action:
    | typeof RESET_PASSWORD_ACTION.EMAIL_VERIFY
    | typeof RESET_PASSWORD_ACTION.RESET_PASSWORD;
}

export async function POST(request: NextRequest) {
    // Rate limit: 5 reset-password requests per 15 minutes per IP
    const rateLimitResponse = checkAuthRateLimit(request, 'reset-password');
    if (rateLimitResponse) return rateLimitResponse;

    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json<BaseResponse>(
                { message: 'Email is required' },
                { status: 400 }
            );
        }

        // Find user
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        // SECURITY: Always return the same message to prevent user enumeration
        if (!user) {
            return NextResponse.json<BaseResponse<RequestResetPasswordData>>(
                {
                    message: 'If this email is registered, you will receive an OTP shortly.',
                    data: { action: RESET_PASSWORD_ACTION.RESET_PASSWORD },
                },
                { status: 200 }
            );
        }

        // Resolve user locale
        const locale = getEmailLocale(request);

        // Generate OTP
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Case 1: Email exists but not confirmed
        if (user.emailVerified === null) {
            // Save hashed email verification OTP
            await db.insert(otpCodes).values({
                id: generateId(),
                userId: user.id,
                code: hashOTP(otpCode),
                type: OTP_TYPE.EMAIL,
                expires: expiresAt.toISOString(),
                verified: false,
            });

            // Send email verification OTP via Brevo
            await sendEmail({
                to: email,
                subject: getEmailSubject('emailVerify', locale),
                htmlContent: emailVerificationOtpEmail(otpCode, locale),
            });

            return NextResponse.json<BaseResponse<RequestResetPasswordData>>(
                {
                    message: 'If this email is registered, you will receive an OTP shortly.',
                    data: { action: RESET_PASSWORD_ACTION.EMAIL_VERIFY },
                },
                { status: 200 }
            );
        }

        // Case 2: Email exists and is confirmed
        // Save hashed reset password OTP
        await db.insert(otpCodes).values({
            id: generateId(),
            userId: user.id,
            code: hashOTP(otpCode),
            type: OTP_TYPE.RESET_PASSWORD,
            expires: expiresAt.toISOString(),
            verified: false,
        });

        // Send reset password OTP via Brevo
        await sendEmail({
            to: email,
            subject: getEmailSubject('resetPassword', locale),
            htmlContent: resetPasswordOtpEmail(otpCode, locale),
        });

        logAuditEvent({ action: 'password_reset_request', email });

        return NextResponse.json<BaseResponse<RequestResetPasswordData>>(
            {
                message: 'If this email is registered, you will receive an OTP shortly.',
                data: { action: RESET_PASSWORD_ACTION.RESET_PASSWORD },
            },
            { status: 200 }
        );
    } catch (error) {
        logger.error({ err: error }, 'Reset password request error'); sendToLogtail('error', 'Reset password request failed', { error: String(error) });
        return NextResponse.json<BaseResponse>(
            { message: 'Failed to process request' },
            { status: 500 }
        );
    }
}
