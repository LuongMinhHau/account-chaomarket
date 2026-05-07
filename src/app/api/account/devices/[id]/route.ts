import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth.config';
import { db } from '@/lib/db';
import { userDevices } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { logAuditEvent } from '@/lib/audit-logger';
import { logger, sendToLogtail } from '@/lib/logger';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        // Verify device belongs to user and is not current
        const [device] = await db
            .select()
            .from(userDevices)
            .where(and(
                eq(userDevices.id, id),
                eq(userDevices.userId, session.user.id),
            ))
            .limit(1);

        if (!device) {
            return NextResponse.json(
                { message: 'Device not found' },
                { status: 404 }
            );
        }

        if (device.isCurrent) {
            return NextResponse.json(
                { message: 'Cannot revoke current device session' },
                { status: 400 }
            );
        }

        // Delete device record (session invalidation)
        await db
            .delete(userDevices)
            .where(and(
                eq(userDevices.id, id),
                eq(userDevices.userId, session.user.id),
            ));

        logAuditEvent({
            action: 'device_revoked',
            userId: session.user.id,
            email: session.user.email,
            meta: {
                deviceName: device.deviceName,
                browser: device.browser,
                os: device.os,
            },
        });

        return NextResponse.json({ message: 'Device session revoked' });
    } catch (error) {
        logger.error({ err: error }, 'Revoke device error'); sendToLogtail('error', 'Device revoke failed', { error: String(error) });
        return NextResponse.json(
            { message: 'Failed to revoke device session' },
            { status: 500 }
        );
    }
}
