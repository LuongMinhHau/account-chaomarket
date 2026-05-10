import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth.config';
import { logger } from '@/lib/logger';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ user: null }, { status: 401 });
        }

        return NextResponse.json({
            user: {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
                role: session.user.role,
            },
        });
    } catch (error) {
        logger.error({ err: error }, 'Me API error');
        return NextResponse.json({ message: 'Internal error' }, { status: 500 });
    }
}
