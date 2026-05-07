import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { db } from '@/lib/db';
import { users, otpCodes } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { BaseResponse } from '@/types/base-response';
import { sendEmail } from '@/lib/brevo';
import { passwordChangedEmail, getEmailSubject, formatEmailDate } from '@/lib/email-templates';
import type { RequestMeta } from '@/lib/email-templates';
import { getEmailLocale } from '@/lib/get-email-locale';
import { checkAuthRateLimit } from '@/lib/auth-rate-limit';
import { logAuditEvent } from '@/lib/audit-logger';
import { logger, sendToLogtail } from '@/lib/logger';

function hashOTP(otp: string): string {
    return createHash('sha256').update(otp).digest('hex');
}

export async function POST(request: NextRequest) {
    // Rate limit: 5 password change attempts per 15 minutes per IP
    const rateLimitResponse = checkAuthRateLimit(request, 'reset-password');
    if (rateLimitResponse) return rateLimitResponse;

    try {
        const { email, password, otp } = await request.json();

        if (!email || !password || !otp) {
            return NextResponse.json<BaseResponse>(
                { message: 'Email, password, and OTP are required' },
                { status: 400 }
            );
        }

        // Server-side password strength validation
        // Must match register endpoint: uppercase, lowercase, digit, and any non-alphanumeric char
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return NextResponse.json<BaseResponse>(
                { message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' },
                { status: 400 }
            );
        }

        // Find user
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (!user) {
            // SECURITY: Return generic error to prevent user enumeration
            return NextResponse.json<BaseResponse>(
                { message: 'Invalid or expired OTP verification' },
                { status: 400 }
            );
        }

        // Verify OTP is valid and verified (compare hashed)
        const [otpRecord] = await db
            .select()
            .from(otpCodes)
            .where(
                and(
                    eq(otpCodes.userId, user.id),
                    eq(otpCodes.code, hashOTP(otp)),
                    eq(otpCodes.verified, true),
                    gt(otpCodes.expires, new Date().toISOString())
                )
            )
            .limit(1);

        if (!otpRecord) {
            return NextResponse.json<BaseResponse>(
                { message: 'Invalid or expired OTP verification' },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update user password
        await db
            .update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, user.id));

        // Invalidate used OTP
        await db
            .update(otpCodes)
            .set({ expires: new Date(Date.now() - 1000).toISOString() })
            .where(eq(otpCodes.id, otpRecord.id));



        logAuditEvent({ action: 'password_reset', userId: user.id, email });

        // Send password changed notification email
        try {
            const locale = getEmailLocale(request);
            const ua = request.headers.get('user-agent') || '';
            const browserMatch = ua.match(/(Chrome|Firefox|Safari|Edge|Opera|Brave)[\/\s](\d+)/);
            const osMatch = ua.match(/(Windows NT|Mac OS X|Linux|Android|iOS)[\s\/]?([\d._]*)/);
            const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
                || request.headers.get('x-real-ip')
                || '';
            const meta: RequestMeta = {
                date: formatEmailDate(new Date(), locale),
                browser: browserMatch ? `${browserMatch[1]} ${browserMatch[2]}` : (locale === 'vi' ? 'Không xác định' : 'Unknown'),
                os: osMatch ? osMatch[1].replace('_', '.') : (locale === 'vi' ? 'Không xác định' : 'Unknown'),
                ...(ip && ip !== '::1' && ip !== '127.0.0.1' ? { location: ip } : {}),
            };
            await sendEmail({
                to: user.email,
                subject: getEmailSubject('passwordChanged', locale),
                htmlContent: passwordChangedEmail(locale, user.name ?? undefined, meta),
            });
        } catch (e) {
            logger.warn({ err: e }, 'Failed to send password changed notification'); sendToLogtail('warn', 'Password changed notification failed', { error: String(e) });
        }

        return NextResponse.json<BaseResponse>(
            { message: 'Password updated successfully' },
            { status: 200 }
        );
    } catch (error) {
        logger.error({ err: error }, 'Password change error'); sendToLogtail('error', 'Password change failed', { error: String(error) });
        return NextResponse.json<BaseResponse>(
            { message: 'Failed to update password' },
            { status: 500 }
        );
    }
}
