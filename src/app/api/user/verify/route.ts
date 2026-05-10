import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth.config';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { checkAuthRateLimit } from '@/lib/auth-rate-limit';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const verifyEmailSchema = z.object({
    email: z.string().email(),
});

export async function GET() {
    try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ data: null }, { status: 401 });
    }

    const [user] = await db
        .select({
            emailVerified: users.emailVerified,
        })
        .from(users)
        .where(eq(users.email, session.user.email))
        .limit(1);

    return NextResponse.json({
        data: {
            emailVerified: user?.emailVerified ?? null,
        },
    });
    } catch (error) {
        logger.error({ err: error }, 'User verify GET error');
        return NextResponse.json({ message: 'Internal error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
    const rateLimitResponse = checkAuthRateLimit(request, 'login');
    if (rateLimitResponse) return rateLimitResponse;

    const parsed = verifyEmailSchema.safeParse(await request.json());
    if (!parsed.success) {
        return NextResponse.json({ message: 'Email is required.' }, { status: 400 });
    }
    const { email } = parsed.data;

    const [user] = await db
        .select({
            emailVerified: users.emailVerified,
            loginVerification: users.loginVerification,
        })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    if (!user) {
        // Anti-enumeration: return same structure
        return NextResponse.json({ message: 'Không tìm thấy tài khoản.' }, { status: 404 });
    }

    return NextResponse.json({
        data: {
            emailVerified: user.emailVerified,
            loginVerification: user.loginVerification,
        },
    });
    } catch (error) {
        logger.error({ err: error }, 'User verify POST error');
        return NextResponse.json({ message: 'Internal error' }, { status: 500 });
    }
}
