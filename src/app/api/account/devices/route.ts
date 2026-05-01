import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth.config';
import { db } from '@/lib/db';
import { userDevices } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const devices = await db
            .select()
            .from(userDevices)
            .where(eq(userDevices.userId, session.user.id))
            .orderBy(desc(userDevices.lastActiveAt))
            .limit(20);

        return NextResponse.json({ devices });
    } catch {
        // Table may not exist yet — return empty
        return NextResponse.json({ devices: [] });
    }
}
