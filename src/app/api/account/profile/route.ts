import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth.config';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { logger, sendToLogtail, logApiEvent } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rate-limiter';
import { z } from 'zod';
import { apiSuccess, apiRateLimited, apiInternalError, parseBody } from '@/lib/api-response';

const profileUpdateSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    phone: z.string().max(20).nullable().optional(),
    gender: z.enum(['male', 'female', 'other']).nullable().optional(),
    dateOfBirth: z.string().nullable().optional(),
});

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const [user] = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            phone: users.phone,
            gender: users.gender,
            dateOfBirth: users.dateOfBirth,
            image: users.image,
            createdAt: users.createdAt,
            emailVerified: users.emailVerified,
        })
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1);

    if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
}

export async function PUT(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!checkRateLimit(`profile:${session.user.id}`, 10, 60_000)) {
        return apiRateLimited();
    }

    const parsed = await parseBody(request, profileUpdateSchema);
    if (parsed.error) return parsed.error;
    const { name, phone, gender, dateOfBirth } = parsed.data;

    try {
        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (gender !== undefined) updateData.gender = gender;
        if (dateOfBirth !== undefined) {
            updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth).toISOString() : null;
        }

        await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, session.user.id));

        logApiEvent('info', 'Profile updated', { userId: session.user.id, fields: Object.keys(updateData) });
        return apiSuccess({ message: 'Profile updated successfully' });
    } catch (error) {
        logger.error({ err: error, userId: session.user.id }, 'Profile update error');
        sendToLogtail('error', 'Profile update failed', { userId: session.user.id, error: String(error) });
        return apiInternalError('Failed to update profile');
    }
}
