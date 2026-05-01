import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth.config';
import { trackDevice } from '@/lib/track-device';

/**
 * POST /api/account/track-device
 * Called client-side after successful login to record the device.
 */
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || '127.0.0.1';

    await trackDevice({
        userId: session.user.id,
        userAgent,
        ip,
    });

    return NextResponse.json({ success: true });
}
