import { db } from '@/lib/db';
import { userDevices } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { logger } from '@/lib/logger';

interface DeviceInfo {
    userId: string;
    userAgent: string;
    ip: string;
}

/**
 * Parse a User-Agent string into device type, browser, and OS.
 */
function parseUserAgent(ua: string) {
    // Device type
    let deviceType = 'desktop';
    if (/mobile|android|iphone|ipod/i.test(ua)) deviceType = 'mobile';
    else if (/ipad|tablet/i.test(ua)) deviceType = 'tablet';

    // Browser
    let browser = 'Unknown';
    if (/edg\//i.test(ua)) browser = 'Edge';
    else if (/chrome\//i.test(ua) && !/chromium/i.test(ua)) browser = 'Chrome';
    else if (/firefox\//i.test(ua)) browser = 'Firefox';
    else if (/safari\//i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
    else if (/opera|opr\//i.test(ua)) browser = 'Opera';

    // OS
    let os = 'Unknown';
    if (/windows/i.test(ua)) os = 'Windows';
    else if (/macintosh|mac os/i.test(ua)) os = 'macOS';
    else if (/linux/i.test(ua) && !/android/i.test(ua)) os = 'Linux';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';

    // Device name
    const deviceName = `${browser} on ${os}`;

    return { deviceType, browser, os, deviceName };
}

/**
 * Record a device login. Upserts based on userId + browser + OS + IP.
 */
export async function trackDevice({ userId, userAgent, ip }: DeviceInfo) {
    try {
        const { deviceType, browser, os, deviceName } = parseUserAgent(userAgent);

        // Check if this device already exists
        const existing = await db
            .select({ id: userDevices.id })
            .from(userDevices)
            .where(
                and(
                    eq(userDevices.userId, userId),
                    eq(userDevices.browser, browser),
                    eq(userDevices.os, os),
                    eq(userDevices.ipAddress, ip),
                )
            )
            .limit(1);

        if (existing.length > 0) {
            // Update last active
            await db
                .update(userDevices)
                .set({ lastActiveAt: new Date().toISOString(), isCurrent: true })
                .where(eq(userDevices.id, existing[0].id));
        } else {
            // Insert new device
            await db.insert(userDevices).values({
                userId,
                deviceName,
                deviceType,
                browser,
                os,
                ipAddress: ip,
                isCurrent: true,
            });
        }

        // Mark all other devices as not current
        await db
            .update(userDevices)
            .set({ isCurrent: false })
            .where(
                and(
                    eq(userDevices.userId, userId),
                    existing.length > 0
                        ? eq(userDevices.id, existing[0].id) // Will be overridden below
                        : eq(userDevices.userId, userId), // placeholder
                )
            );

        // Re-mark current device
        const [latest] = await db
            .select({ id: userDevices.id })
            .from(userDevices)
            .where(
                and(
                    eq(userDevices.userId, userId),
                    eq(userDevices.browser, browser),
                    eq(userDevices.os, os),
                    eq(userDevices.ipAddress, ip),
                )
            )
            .limit(1);

        if (latest) {
            await db
                .update(userDevices)
                .set({ isCurrent: true })
                .where(eq(userDevices.id, latest.id));
        }
    } catch (error) {
        // Non-blocking — don't crash login
        logger.warn({ err: error }, '[trackDevice] Non-blocking error');
    }
}
