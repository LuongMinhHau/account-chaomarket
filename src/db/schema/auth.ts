import {
    pgTable,
    unique,
    uuid,
    text,
    timestamp,
    foreignKey,
    boolean,
    integer,
    primaryKey,
} from 'drizzle-orm/pg-core';
import { userRole, userStatus } from './enums';

// ── Users ──
export const users = pgTable(
    'user',
    {
        id: uuid().defaultRandom().primaryKey().notNull(),
        name: text(),
        email: text().notNull(),
        emailVerified: timestamp({ mode: 'string' }),
        image: text(),
        password: text(),
        phone: text(),
        phoneVerified: timestamp({ mode: 'string' }),
        role: userRole().default('USER').notNull(),
        dateOfBirth: timestamp({ mode: 'string' }),
        gender: text(),
        status: userStatus().default('ACTIVE'),
        createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
        updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull().$onUpdate(() => new Date().toISOString()),
        banUntil: timestamp({ mode: 'string' }),
    },
    table => [unique('user_email_unique').on(table.email)]
);

// ── Accounts (OAuth providers) ──
export const accounts = pgTable(
    'account',
    {
        userId: uuid().notNull(),
        type: text().notNull(),
        provider: text().notNull(),
        providerAccountId: text().notNull(),
        refreshToken: text('refresh_token'),
        accessToken: text('access_token'),
        expiresAt: integer('expires_at'),
        tokenType: text('token_type'),
        scope: text(),
        idToken: text('id_token'),
        sessionState: text('session_state'),
    },
    table => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: 'account_userId_user_id_fk',
        }).onDelete('cascade'),
        primaryKey({
            columns: [table.provider, table.providerAccountId],
            name: 'account_provider_providerAccountId_pk',
        }),
    ]
);

// ── Sessions ──
export const sessions = pgTable(
    'sessions',
    {
        sessionToken: text().primaryKey().notNull(),
        userId: uuid().notNull(),
        expires: timestamp({ mode: 'string' }).notNull(),
    },
    table => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: 'sessions_userId_user_id_fk',
        }).onDelete('cascade'),
    ]
);

// ── OTP Codes ──
export const otpCodes = pgTable(
    'otpCodes',
    {
        id: text().primaryKey().notNull(),
        userId: uuid().notNull(),
        code: text().notNull(),
        type: text().notNull(),
        expires: timestamp({ mode: 'string' }).notNull(),
        verified: boolean().default(false).notNull(),
        createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
    },
    table => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [users.id],
            name: 'otpCodes_userId_user_id_fk',
        }).onDelete('cascade'),
    ]
);

// ── Verification Tokens ──
export const verificationTokens = pgTable(
    'verificationTokens',
    {
        identifier: text().notNull(),
        token: text().notNull(),
        expires: timestamp({ mode: 'string' }).notNull(),
    },
    table => [
        primaryKey({
            columns: [table.identifier, table.token],
            name: 'verificationTokens_identifier_token_pk',
        }),
    ]
);
