import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth.config';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { logger, sendToLogtail } from '@/lib/logger';

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

    try {
        const { name, phone, gender, dateOfBirth } = await request.json();

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

        return NextResponse.json({ message: 'Profile updated successfully' });
    } catch (error) {
        logger.error({ err: error, userId: session.user.id }, 'Profile update error');
        sendToLogtail('error', 'Profile update failed', { userId: session.user.id, error: String(error) });
        return NextResponse.json({ message: 'Failed to update profile' }, { status: 500 });
    }
}
