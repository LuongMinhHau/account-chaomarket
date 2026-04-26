import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { CustomAdapter } from './next-auth.adapter';

// Augment NextAuth types for type safety
declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            role: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: string;
    }
}

export const authOptions: NextAuthOptions = {
    adapter: CustomAdapter,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            profile(profile) {
                return {
                    ...profile,
                    id: profile.sub,
                };
            },
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const [user] = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, credentials.email))
                    .limit(1);

                if (!user || !user.password) {
                    return null;
                }

                if (user.status === 'BANNED') {
                    throw new Error('Account is suspended');
                }

                const isValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                };
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    cookies: process.env.COOKIE_DOMAIN
        ? {
            sessionToken: {
                name: `__Secure-next-auth.session-token`,
                options: {
                    httpOnly: true,
                    sameSite: 'lax',
                    path: '/',
                    secure: true,
                    domain: process.env.COOKIE_DOMAIN, // '.chaomarket.com'
                },
            },
        }
        : undefined,
    pages: {
        signIn: '/auth/login',
        newUser: '/auth/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async redirect({ url, baseUrl }) {
            // Allow redirects to any *.chaomarket.com subdomain
            if (url.startsWith('/')) return `${baseUrl}${url}`;
            try {
                const urlObj = new URL(url);
                if (
                    urlObj.hostname === 'chaomarket.com' ||
                    urlObj.hostname.endsWith('.chaomarket.com') ||
                    urlObj.hostname === 'localhost' ||
                    urlObj.origin === baseUrl
                ) {
                    return url;
                }
            } catch {}
            return baseUrl;
        },
        async jwt({ token, user, trigger }) {
            if (user) {
                const [existingUser] = await db
                    .select({
                        role: users.role,
                        image: users.image,
                        name: users.name,
                    })
                    .from(users)
                    .where(eq(users.id, user.id))
                    .limit(1);
                token.id = user.id;
                token.role = existingUser?.role ?? 'USER';
                token.picture = existingUser?.image ?? user.image;
                token.name = existingUser?.name ?? user.name;
            }
            if (trigger === 'update') {
                const [latestUser] = await db
                    .select({ image: users.image, name: users.name })
                    .from(users)
                    .where(eq(users.id, token.id))
                    .limit(1);
                if (latestUser) {
                    token.picture = latestUser.image;
                    token.name = latestUser.name;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.image =
                    (token.picture as string | null) ?? session.user.image;
                session.user.name =
                    (token.name as string | null) ?? session.user.name;
            }
            return session;
        },
    },
};
