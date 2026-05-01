import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth.config';
import { db } from '@/lib/db';
import { auditLogs } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const logs = await db
            .select({
                action: auditLogs.action,
                ipAddress: auditLogs.ipAddress,
                createdAt: auditLogs.createdAt,
            })
            .from(auditLogs)
            .where(eq(auditLogs.userId, session.user.id))
            .orderBy(desc(auditLogs.createdAt))
            .limit(20);

        return NextResponse.json({ logs });
    } catch (error) {
        console.error('Audit logs error:', error);
        return NextResponse.json({ logs: [] });
    }
}
