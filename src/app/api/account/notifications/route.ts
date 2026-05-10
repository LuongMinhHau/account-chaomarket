import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth.config';
import { db } from '@/lib/db';
import { notifications } from '@/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import { logger, sendToLogtail } from '@/lib/logger';
import { z } from 'zod';

const notificationUpdateSchema = z.union([
    z.object({ markAllRead: z.literal(true) }),
    z.object({ toggleStar: z.literal(true), notificationId: z.string(), isStarred: z.boolean().optional() }),
    z.object({ ids: z.array(z.string()).min(1), isRead: z.boolean().optional() }),
    z.object({ notificationId: z.string() }),
]);

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const items = await db
            .select()
            .from(notifications)
            .where(eq(notifications.userId, session.user.id))
            .orderBy(desc(notifications.createdAt))
            .limit(50);

        return NextResponse.json({ notifications: items });
    } catch (error) {
        logger.error({ err: error }, 'Notifications fetch error'); sendToLogtail('error', 'Notifications fetch failed', { error: String(error) });
        return NextResponse.json({ notifications: [] });
    }
}

export async function PUT(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const parsed = notificationUpdateSchema.safeParse(await request.json());
        if (!parsed.success) {
            return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
        }
        const body = parsed.data;

        if ('markAllRead' in body) {
            // Mark all as read
            await db
                .update(notifications)
                .set({ isRead: true })
                .where(eq(notifications.userId, session.user.id));
        } else if ('toggleStar' in body) {
            // Toggle star on a single notification
            const isStarred = body.isStarred !== undefined ? body.isStarred : false;
            await db
                .update(notifications)
                .set({ isStarred })
                .where(eq(notifications.id, body.notificationId));
        } else if ('ids' in body) {
            // Mark specific IDs as read/unread
            const isRead = body.isRead !== undefined ? body.isRead : true;
            await db
                .update(notifications)
                .set({ isRead })
                .where(inArray(notifications.id, body.ids));
        } else if ('notificationId' in body) {
            // Legacy single-ID support
            await db
                .update(notifications)
                .set({ isRead: true })
                .where(eq(notifications.id, body.notificationId));
        }

        return NextResponse.json({ message: 'Updated' });
    } catch (error) {
        logger.error({ err: error }, 'Notification update error'); sendToLogtail('error', 'Notification update failed', { error: String(error) });
        return NextResponse.json({ message: 'Failed to update' }, { status: 500 });
    }
}
