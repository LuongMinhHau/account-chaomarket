import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

/**
 * GET /api/health
 * Enterprise health check endpoint for monitoring & load balancer probes.
 * Returns system status, uptime, and database connectivity.
 */
export async function GET() {
    const start = Date.now();

    // Check database connectivity
    let dbStatus: 'healthy' | 'unhealthy' = 'unhealthy';
    let dbLatencyMs = 0;

    try {
        const dbStart = Date.now();
        await db.execute(sql`SELECT 1`);
        dbLatencyMs = Date.now() - dbStart;
        dbStatus = 'healthy';
    } catch {
        dbStatus = 'unhealthy';
    }

    const isHealthy = dbStatus === 'healthy';
    const totalLatencyMs = Date.now() - start;

    const body = {
        status: isHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        checks: {
            database: {
                status: dbStatus,
                latencyMs: dbLatencyMs,
            },
        },
        latencyMs: totalLatencyMs,
    };

    return NextResponse.json(body, {
        status: isHealthy ? 200 : 503,
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
    });
}
