import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth.config';
import { db } from '@/lib/db';
import { notifications } from '@/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';

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
        console.error('Notifications fetch error:', error);
        return NextResponse.json({ notifications: [] });
    }
}

export async function PUT(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();

        if (body.markAllRead) {
            // Mark all as read
            await db
                .update(notifications)
                .set({ isRead: true })
                .where(eq(notifications.userId, session.user.id));
        } else if (body.toggleStar && body.notificationId) {
            // Toggle star on a single notification
            const isStarred = body.isStarred !== undefined ? body.isStarred : false;
            await db
                .update(notifications)
                .set({ isStarred })
                .where(eq(notifications.id, body.notificationId));
        } else if (body.ids && Array.isArray(body.ids)) {
            // Mark specific IDs as read/unread
            const isRead = body.isRead !== undefined ? body.isRead : true;
            await db
                .update(notifications)
                .set({ isRead })
                .where(inArray(notifications.id, body.ids));
        } else if (body.notificationId) {
            // Legacy single-ID support
            await db
                .update(notifications)
                .set({ isRead: true })
                .where(eq(notifications.id, body.notificationId));
        }

        return NextResponse.json({ message: 'Updated' });
    } catch (error) {
        console.error('Notification update error:', error);
        return NextResponse.json({ message: 'Failed to update' }, { status: 500 });
    }
}
