import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { checkAuthRateLimit } from '@/lib/auth-rate-limit';
import { logAuditEvent } from '@/lib/audit-logger';
import { logger, sendToLogtail, logApiEvent } from '@/lib/logger';
import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[a-z]/, 'Must contain a lowercase letter')
        .regex(/[A-Z]/, 'Must contain an uppercase letter')
        .regex(/\d/, 'Must contain a number')
        .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
    name: z.string().min(1, 'Name is required').max(100),
    gender: z.string().min(1, 'Gender is required'),
    dateOfBirth: z.string().nullable().optional(),
    phoneNumber: z.string().max(20).nullable().optional(),
});

export async function POST(request: NextRequest) {
    const rateLimitResponse = checkAuthRateLimit(request, 'register');
    if (rateLimitResponse) return rateLimitResponse;

    try {
        const parsed = registerSchema.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.issues.map(i => i.message).join(', ') },
                { status: 400 }
            );
        }
        const { email, password, name, gender, dateOfBirth, phoneNumber } = parsed.data;

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

        logApiEvent('info', 'User registered', { userId: newUser.id, email }); logAuditEvent({ action: 'register', userId: newUser.id, email });

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
