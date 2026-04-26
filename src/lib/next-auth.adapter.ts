/**
 * Custom NextAuth adapter extending DrizzleAdapter.
 * Uses `any` types due to schema mismatch between next-auth's expected types
 * and our custom Drizzle schema (additional fields like `role`).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Adapter } from 'next-auth/adapters';
import { db } from './db';
import { accounts, sessions, users, verificationTokens } from '@/db/schema';
import { DrizzleAdapter } from '@auth/drizzle-adapter';

export const CustomAdapter: Adapter = {
    ...DrizzleAdapter(db, {
        usersTable: users as any,
        accountsTable: accounts as any,
        sessionsTable: sessions as any,
        verificationTokensTable: verificationTokens as any,
    } as any),
    async createUser(user: any) {
        return await db
            .insert(users)
            .values({
                ...user,
                role: user.role || 'USER',
            })
            .returning()
            .then(res => res[0] ?? null) as any;
    },
};
