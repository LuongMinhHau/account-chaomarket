import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth.config';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateSecret, generateURI, verifySync } from 'otplib';
import * as QRCode from 'qrcode';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { checkRateLimit } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const totpVerifySchema = z.object({
    code: z.string().min(1, 'Code required').max(10),
});

/**
 * GET  — Check 2FA status
 * POST — Generate TOTP secret + QR code (setup step 1)
 * PUT  — Verify TOTP code and enable 2FA (setup step 2)
 * DELETE — Disable 2FA
 */

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const [user] = await db
            .select({ totpEnabled: users.totpEnabled })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        return NextResponse.json({ enabled: user?.totpEnabled ?? false });
    } catch (error) {
        logger.error({ err: error }, '2FA GET error');
        return NextResponse.json({ message: 'Internal error' }, { status: 500 });
    }
}

export async function POST() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        if (!checkRateLimit(`2fa-setup:${session.user.id}`, 3, 60_000)) {
            return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
        }

        // Generate TOTP secret
        const secret = generateSecret();
        const otpauth = generateURI({
            secret,
            issuer: 'Chào Account',
            label: session.user.email || session.user.id,
        });

        // Generate QR code as data URL
        const qrDataUrl = await QRCode.toDataURL(otpauth);

        // Store secret temporarily (not yet enabled)
        await db
            .update(users)
            .set({ totpSecret: secret, totpEnabled: false })
            .where(eq(users.id, session.user.id));

        return NextResponse.json({
            secret,
            qrCode: qrDataUrl,
            otpauth,
        });
    } catch (error) {
        logger.error({ err: error }, '2FA POST error');
        return NextResponse.json({ message: 'Failed to setup 2FA' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        if (!checkRateLimit(`2fa-verify:${session.user.id}`, 5, 60_000)) {
            return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
        }

        const parsed = totpVerifySchema.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json({ message: 'Code required' }, { status: 400 });
        }
        const { code } = parsed.data;

        // Get stored secret
        const [user] = await db
            .select({ totpSecret: users.totpSecret })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        if (!user?.totpSecret) {
            return NextResponse.json({ message: 'Setup not started' }, { status: 400 });
        }

        // Verify code
        const isValid = verifySync({ token: code, secret: user.totpSecret });
        if (!isValid) {
            return NextResponse.json({ message: 'Invalid code' }, { status: 400 });
        }

        // Generate backup codes (10 codes, 8 chars each)
        const rawBackupCodes: string[] = [];
        const hashedBackupCodes: string[] = [];
        for (let i = 0; i < 10; i++) {
            const backupCode = crypto.randomBytes(4).toString('hex').toUpperCase();
            rawBackupCodes.push(backupCode);
            hashedBackupCodes.push(await bcrypt.hash(backupCode, 10));
        }

        // Enable 2FA
        await db
            .update(users)
            .set({
                totpEnabled: true,
                backupCodes: JSON.stringify(hashedBackupCodes),
            })
            .where(eq(users.id, session.user.id));

        return NextResponse.json({
            success: true,
            backupCodes: rawBackupCodes, // Show once, user must save them
        });
    } catch (error) {
        logger.error({ err: error }, '2FA PUT error');
        return NextResponse.json({ message: 'Failed to verify 2FA' }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        if (!checkRateLimit(`2fa-disable:${session.user.id}`, 3, 60_000)) {
            return NextResponse.json({ message: 'Too many requests' }, { status: 429 });
        }

        await db
            .update(users)
            .set({
                totpSecret: null,
                totpEnabled: false,
                backupCodes: null,
            })
            .where(eq(users.id, session.user.id));

        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error({ err: error }, '2FA DELETE error');
        return NextResponse.json({ message: 'Failed to disable 2FA' }, { status: 500 });
    }
}
