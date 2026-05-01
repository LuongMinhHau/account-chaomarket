import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/next-auth.config';

/**
 * Get server session with compatibility for both App Router and Pages Router.
 * Uses `any` for context because next-auth's getServerSession accepts different
 * context shapes depending on the router type.
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- context varies between App Router and Pages Router */
export async function appGetServerSession(context: any) {
    const session = await getServerSession(
        context.req,
        context.res,
        authOptions
    );

    if (!session) {
        return null;
    }

    return session;
}
