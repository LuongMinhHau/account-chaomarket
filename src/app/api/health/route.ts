import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
    try {
        await db.execute(sql`SELECT 1`);
        return NextResponse.json({ status: 'healthy', service: 'chao-market-accounts' });
    } catch {
        return NextResponse.json({ status: 'unhealthy' }, { status: 503 });
    }
}
