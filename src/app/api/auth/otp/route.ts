import { NextRequest, NextResponse } from 'next/server';
import { randomInt, createHash } from 'crypto';
import { checkAuthRateLimit } from '@/lib/auth-rate-limit';
import { db } from '@/lib/db';
import { users, otpCodes } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { sendEmail } from '@/lib/brevo';
import { generateId } from '@/utils/generate-id';
import { otpVerificationEmail, changePasswordOtpEmail, editProfileOtpEmail, welcomeEmail, getEmailSubject, formatEmailDate } from '@/lib/email-templates';
import type { RequestMeta } from '@/lib/email-templates';
import type { EmailLocale } from '@/lib/get-email-locale';
import { getEmailLocale } from '@/lib/get-email-locale';
import { logAuditEvent } from '@/lib/audit-logger';
import { logger, sendToLogtail, logApiEvent } from '@/lib/logger';

// Generate random 6-digit OTP using cryptographically secure randomness
function generateOTP(): string {
    return randomInt(100000, 1000000).toString();
}

// Hash OTP before storing (one-way, prevents reading OTP from DB leaks)
function hashOTP(otp: string): string {
    return createHash('sha256').update(otp).digest('hex');
}

// Parse User-Agent string to extract browser and OS
function parseUserAgent(ua: string): { browser: string; os: string } {
    let browser = 'Unknown';
    if (ua.includes('Edg/')) browser = 'Microsoft Edge';
    else if (ua.includes('OPR/') || ua.includes('Opera')) browser = 'Opera';
    else if (ua.includes('Chrome/') && !ua.includes('Edg/')) browser = 'Chrome';
    else if (ua.includes('Safari/') && !ua.includes('Chrome/')) browser = 'Safari';
    else if (ua.includes('Firefox/')) browser = 'Firefox';

    let os = 'Unknown';
    if (ua.includes('Windows NT')) os = 'Windows';
    else if (ua.includes('Mac OS X') || ua.includes('Macintosh')) os = 'Mac OS X';
    else if (ua.includes('Linux') && !ua.includes('Android')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    return { browser, os };
}

// Extract request metadata for email
function getRequestMeta(request: NextRequest, locale: EmailLocale): RequestMeta {
    const ua = request.headers.get('user-agent') || '';
    const { browser, os } = parseUserAgent(ua);
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || '';

    return {
        date: formatEmailDate(new Date(), locale),
        browser,
        os,
        ...(ip && ip !== '::1' && ip !== '127.0.0.1' ? { location: ip } : {}),
    };
}

export async function POST(request: NextRequest) {
    // Rate limit: 5 OTP send requests per 5 minutes per IP
    const rateLimitResponse = checkAuthRateLimit(request, 'otp');
    if (rateLimitResponse) return rateLimitResponse;

    try {
        const { email, type = 'email', locale: requestLocale, purpose = 'otpVerify' } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
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
            // SECURITY: Return generic success to prevent user enumeration
            return NextResponse.json(
                { message: 'If this email is registered, an OTP will be sent.' },
                { status: 200 }
            );
        }

        // Generate OTP
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Save hashed OTP to database (plain text is sent via email only)
        await db.insert(otpCodes).values({
            id: generateId(),
            userId: user.id,
            code: hashOTP(otpCode),
            type,
            expires: expiresAt.toISOString(),
            verified: false,
        });

        // Send OTP via Brevo email API
        if (type === 'email') {
            // Use frontend locale if provided, otherwise detect
            const locale = (requestLocale === 'vi' || requestLocale === 'en')
                ? requestLocale
                : getEmailLocale(request);
            const meta = getRequestMeta(request, locale);

            // Select email template based on purpose
            let htmlContent: string;
            let emailSubject: string;
            switch (purpose) {
                case 'changePassword':
                    htmlContent = changePasswordOtpEmail(otpCode, locale, user.name ?? undefined, meta);
                    emailSubject = getEmailSubject('changePassword', locale);
                    break;
                case 'editProfile':
                    htmlContent = editProfileOtpEmail(otpCode, locale, user.name ?? undefined, meta);
                    emailSubject = getEmailSubject('editProfile', locale);
                    break;
                default:
                    htmlContent = otpVerificationEmail(otpCode, locale, user.name ?? undefined, meta);
                    emailSubject = getEmailSubject('otpVerify', locale);
                    break;
            }

            await sendEmail({
                to: email,
                subject: emailSubject,
                htmlContent,
            });
        }

        logApiEvent('info', 'OTP sent', { email, purpose }); logAuditEvent({ action: 'otp_send', email, details: { purpose } });

        return NextResponse.json(
            { message: 'OTP sent successfully' },
            { status: 200 }
        );
    } catch (error) {
        logger.error({ err: error }, 'OTP generation error');
        sendToLogtail('error', 'OTP generation failed', { error: String(error) });
        return NextResponse.json(
            { error: 'Failed to send OTP' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    // Rate limit: 10 OTP verify attempts per 5 minutes per IP
    const rateLimitResponse = checkAuthRateLimit(request, 'otp-verify');
    if (rateLimitResponse) return rateLimitResponse;

    try {
        const { email, otp } = await request.json();

        if (!email || !otp) {
            return NextResponse.json(
                { error: 'Email and OTP are required' },
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
            return NextResponse.json(
                { error: 'Invalid or expired OTP' },
                { status: 400 }
            );
        }

        // Verify OTP — compare hashed input against stored hash
        const hashedInput = hashOTP(otp);
        const matchingOtps = await db
            .select()
            .from(otpCodes)
            .where(
                and(
                    eq(otpCodes.userId, user.id),
                    eq(otpCodes.code, hashedInput),
                    eq(otpCodes.verified, false)
                )
            )
            .limit(5);


        // Find a non-expired matching OTP
        // Note: PostgreSQL timestamp without timezone stores UTC but without 'Z' suffix
        // new Date('2026-02-20 17:02:07') parses as LOCAL time, not UTC
        // Append 'Z' to force UTC interpretation
        const otpRecord = matchingOtps.find(r => {
            const expiresStr = r.expires.endsWith('Z') ? r.expires : r.expires + 'Z';
            return new Date(expiresStr) > new Date();
        });

        if (!otpRecord) {
            return NextResponse.json(
                { error: 'Invalid or expired OTP' },
                { status: 400 }
            );
        }

        // Mark OTP as verified
        await db
            .update(otpCodes)
            .set({ verified: true })
            .where(eq(otpCodes.id, otpRecord.id));

        // Check if this is first-time email verification
        const isFirstVerification = user.emailVerified === null;

        // Update user verification status
        await db
            .update(users)
            .set({ emailVerified: new Date().toISOString() })
            .where(eq(users.id, user.id));

        // Send welcome email on first-time verification
        if (isFirstVerification) {
            try {
                const locale = getEmailLocale(request);
                await sendEmail({
                    to: user.email,
                    subject: getEmailSubject('welcome', locale),
                    htmlContent: welcomeEmail(locale, user.name ?? undefined),
                    sender: 'noreply',
                });
            } catch (e) {
                // Don't fail the verification if welcome email fails
                logger.warn({ err: e, userId: user.id }, 'Failed to send welcome email');
                sendToLogtail('warn', 'Welcome email failed', { userId: user.id, error: String(e) });
            }
        }

        logApiEvent('info', 'OTP verified', { userId: user.id, firstVerification: isFirstVerification }); logAuditEvent({ action: 'otp_verify', userId: user.id, email, details: { firstVerification: isFirstVerification } });

        return NextResponse.json(
            { message: 'OTP verify successfully' },
            { status: 200 }
        );
    } catch (error) {
        logger.error({ err: error }, 'OTP verification error');
        sendToLogtail('error', 'OTP verification failed', { error: String(error) });
        return NextResponse.json(
            { error: 'Failed to verify OTP' },
            { status: 500 }
        );
    }
}
