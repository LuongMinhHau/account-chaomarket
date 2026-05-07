import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth.config';
import { db } from '@/lib/db';
import { accounts, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { logger, sendToLogtail } from '@/lib/logger';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get linked OAuth providers
        const linkedAccounts = await db
            .select({
                provider: accounts.provider,
                type: accounts.type,
            })
            .from(accounts)
            .where(eq(accounts.userId, session.user.id));

        // Get user info for data summary
        const [user] = await db
            .select({
                email: users.email,
                name: users.name,
                phone: users.phone,
                createdAt: users.createdAt,
                emailVerified: users.emailVerified,
                hasPassword: users.password,
            })
            .from(users)
            .where(eq(users.id, session.user.id))
            .limit(1);

        return NextResponse.json({
            linkedProviders: linkedAccounts.map(a => a.provider),
            hasPassword: !!user?.hasPassword,
            dataSummary: {
                email: user?.email,
                name: user?.name,
                phone: user?.phone,
                memberSince: user?.createdAt,
                emailVerified: !!user?.emailVerified,
            },
        });
    } catch (error) {
        logger.error({ err: error }, 'Privacy data error'); sendToLogtail('error', 'Privacy data fetch failed', { error: String(error) });
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}
