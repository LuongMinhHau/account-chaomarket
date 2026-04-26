import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth.config';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
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
}
