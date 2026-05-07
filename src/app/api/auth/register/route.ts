import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { checkAuthRateLimit } from '@/lib/auth-rate-limit';
import { logAuditEvent } from '@/lib/audit-logger';
import { logger, sendToLogtail } from '@/lib/logger';

export async function POST(request: NextRequest) {
    const rateLimitResponse = checkAuthRateLimit(request, 'register');
    if (rateLimitResponse) return rateLimitResponse;

    try {
        const { email, password, name, gender, dateOfBirth, phoneNumber } =
            await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return NextResponse.json(
                { error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' },
                { status: 400 }
            );
        }

        if (!name || !gender) {
            return NextResponse.json(
                { error: 'Name, gender and date of birth are required' },
                { status: 400 }
            );
        }

        const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (existingUser) {
            return NextResponse.json(
                {
                    message: 'Registration initiated. Check your email for verification.',
                    user: { id: 'redacted', email, name },
                },
                { status: 201 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const [newUser] = await db
            .insert(users)
            .values({
                email,
                password: hashedPassword,
                name,
                gender,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
                phone: phoneNumber,
            })
            .returning({
                id: users.id,
                email: users.email,
                name: users.name,
            });

        logAuditEvent({ action: 'register', userId: newUser.id, email });

        return NextResponse.json(
            { message: 'User created successfully', user: newUser },
            { status: 201 }
        );
    } catch (error) {
        logger.error({ err: error }, 'Registration error');
        sendToLogtail('error', 'Registration failed', { error: String(error) });
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
