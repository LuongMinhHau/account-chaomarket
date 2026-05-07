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

/**
 * GET  — Check 2FA status
 * POST — Generate TOTP secret + QR code (setup step 1)
 * PUT  — Verify TOTP code and enable 2FA (setup step 2)
 * DELETE — Disable 2FA
 */

export async function GET() {
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
}

export async function POST() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
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
}

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await request.json();
    if (!code || typeof code !== 'string') {
        return NextResponse.json({ message: 'Code required' }, { status: 400 });
    }

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
}

export async function DELETE() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
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
}
