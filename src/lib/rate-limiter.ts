// In-memory rate limiter — tracks request timestamps per key
// Sufficient for single-server deployment. Migrate to Redis for multi-server.

const requestLog = new Map<string, number[]>();

export function checkRateLimit(
    keyIdentifier: string,
    maxRequests: number = 10,
    windowMs: number = 60_000
): boolean {
    const now = Date.now();
    const timestamps = requestLog.get(keyIdentifier) || [];
    const validTimestamps = timestamps.filter((t) => now - t < windowMs);

    if (validTimestamps.length >= maxRequests) {
        requestLog.set(keyIdentifier, validTimestamps);
        return false;
    }

    validTimestamps.push(now);
    requestLog.set(keyIdentifier, validTimestamps);
    return true;
}

export function getRateLimitInfo(
    keyIdentifier: string,
    maxRequests: number = 10,
    windowMs: number = 60_000
): { remaining: number; resetIn: number } {
    const now = Date.now();
    const timestamps = requestLog.get(keyIdentifier) || [];
    const validTimestamps = timestamps.filter((t) => now - t < windowMs);

    const oldest = validTimestamps[0];
    const resetIn = oldest ? Math.ceil((oldest + windowMs - now) / 1000) : 0;

    return {
        remaining: Math.max(0, maxRequests - validTimestamps.length),
        resetIn,
    };
}

// ── Periodic Cleanup (prevent memory leak) ──
// Prune expired entries every 5 minutes to keep Map bounded.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const MAX_WINDOW_MS = 15 * 60 * 1000; // Longest window across all rate limit configs

if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, timestamps] of requestLog) {
            const valid = timestamps.filter((t) => now - t < MAX_WINDOW_MS);
            if (valid.length === 0) {
                requestLog.delete(key);
            } else {
                requestLog.set(key, valid);
            }
        }
    }, CLEANUP_INTERVAL_MS);
}

