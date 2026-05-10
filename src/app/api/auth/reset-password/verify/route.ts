import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, otpCodes } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { BaseResponse } from '@/types/base-response';
import { OTP_TYPE } from '@/app/api/auth/reset-password/constants';
import { checkAuthRateLimit } from '@/lib/auth-rate-limit';
import { logAuditEvent } from '@/lib/audit-logger';
import { logger, sendToLogtail } from '@/lib/logger';
import { z } from 'zod';

const verifyOtpSchema = z.object({
    email: z.string().email(),
    otp: z.string().min(1),
});

import { hashOTP } from '@/lib/otp';

// Response types
export interface VerifyResetPasswordData {
    emailVerified?: boolean;
}

export async function POST(request: NextRequest) {
    // Rate limit: 10 OTP verify attempts per 5 minutes per IP
    const rateLimitResponse = checkAuthRateLimit(request, 'otp-verify');
    if (rateLimitResponse) return rateLimitResponse;

    try {
        const parsed = verifyOtpSchema.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json<BaseResponse>(
                { message: 'Email and OTP are required' },
                { status: 400 }
            );
        }
        const { email, otp } = parsed.data;

        // Find user
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (!user) {
            // SECURITY: Return generic error to prevent user enumeration
            return NextResponse.json<BaseResponse>(
                { message: 'Invalid or expired OTP' },
                { status: 400 }
            );
        }

        // Case 1: Email not verified - verify email with OTP
        if (user.emailVerified === null) {
            const [otpRecord] = await db
                .select()
                .from(otpCodes)
                .where(
                    and(
                        eq(otpCodes.userId, user.id),
                        eq(otpCodes.code, hashOTP(otp)),
                        eq(otpCodes.type, OTP_TYPE.EMAIL),
                        eq(otpCodes.verified, false),
                        gt(otpCodes.expires, new Date().toISOString())
                    )
                )
                .limit(1);

            if (!otpRecord) {
                return NextResponse.json<BaseResponse>(
                    { message: 'Invalid or expired OTP' },
                    { status: 400 }
                );
            }

            // Mark OTP as verified and update email verification
            await db
                .update(otpCodes)
                .set({ verified: true })
                .where(eq(otpCodes.id, otpRecord.id));

            await db
                .update(users)
                .set({ emailVerified: new Date().toISOString() })
                .where(eq(users.id, user.id));

            return NextResponse.json<BaseResponse<VerifyResetPasswordData>>(
                {
                    message: 'Email verified successfully',
                    data: { emailVerified: true },
                },
                { status: 200 }
            );
        }

        // Case 2: Email verified - verify reset password OTP
        const [otpRecord] = await db
            .select()
            .from(otpCodes)
            .where(
                and(
                    eq(otpCodes.userId, user.id),
                    eq(otpCodes.code, hashOTP(otp)),
                    eq(otpCodes.type, OTP_TYPE.RESET_PASSWORD),
                    eq(otpCodes.verified, false),
                    gt(otpCodes.expires, new Date().toISOString())
                )
            )
            .limit(1);

        if (!otpRecord) {
            return NextResponse.json<BaseResponse>(
                { message: 'Invalid or expired OTP' },
                { status: 400 }
            );
        }

        // Mark OTP as verified
        await db
            .update(otpCodes)
            .set({ verified: true })
            .where(eq(otpCodes.id, otpRecord.id));

        logAuditEvent({ action: 'otp_verify', userId: user.id, email, details: { type: 'reset_password' } });

        return NextResponse.json<BaseResponse<VerifyResetPasswordData>>(
            {
                message: 'OTP verified successfully',
                data: { emailVerified: true },
            },
            { status: 200 }
        );
    } catch (error) {
        logger.error({ err: error }, 'Reset password OTP verification error'); sendToLogtail('error', 'Reset password OTP verify failed', { error: String(error) });
        return NextResponse.json<BaseResponse>(
            { message: 'Failed to verify OTP' },
            { status: 500 }
        );
    }
}
