import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth.config';

export async function GET() {
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
}
