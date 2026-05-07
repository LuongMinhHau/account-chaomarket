import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth.config';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { uploadAvatar } from '@/services/storage/upload-avatar';
import { logger, sendToLogtail, logApiEvent } from '@/lib/logger';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('avatar') as File | null;

        if (!file) {
            return NextResponse.json({ message: 'No file provided' }, { status: 400 });
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json({ message: 'File too large (max 5MB)' }, { status: 400 });
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ message: 'Invalid file type' }, { status: 400 });
        }

        const result = await uploadAvatar(file);

        if (!result.success || !result.url) {
            return NextResponse.json({ message: result.error || 'Upload failed' }, { status: 500 });
        }

        // Update user image in DB
        await db
            .update(users)
            .set({ image: result.url })
            .where(eq(users.id, session.user.id));

        logApiEvent('info', 'Avatar uploaded', { userId: session.user.id }); return NextResponse.json({ url: result.url });
    } catch (error) {
        logger.error({ err: error, userId: session.user.id }, 'Avatar upload error');
        sendToLogtail('error', 'Avatar upload failed', { userId: session.user.id, error: String(error) });
        return NextResponse.json({ message: 'Upload failed' }, { status: 500 });
    }
}
