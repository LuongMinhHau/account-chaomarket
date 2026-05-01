/**
 * Typed shape for the user object on a NextAuth session.
 * Use `(session.user as SessionUser)` instead of `(session.user as any)`.
 */
export interface SessionUser {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
}
