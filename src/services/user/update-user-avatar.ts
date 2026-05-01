
'use server';

import { db } from '@/lib/db'; // ✅ your Drizzle instance
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/next-auth.config';
import { users } from '@/db/schema';
import { SessionUser } from '@/types/session-user';

export const updateUserAvatar = async (newUrl: string) => {
    // ✅ Validate input
    if (!newUrl || typeof newUrl !== 'string') {
        return { success: false, error: 'Invalid avatar URL' };
    }

    // ✅ Get current user (Auth.js example)
    const session = await getServerSession(authOptions);
    const userId = (session?.user as SessionUser)?.id;

    if (!userId) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const [updatedUser] = await db
            .update(users)
            .set({ image: newUrl }) // ← adjust field name if needed (e.g., `avatar`, `profileImage`)
            .where(eq(users.id, userId))
            .returning({ id: users.id, image: users.image });

        if (!updatedUser) {
            return { success: false, error: 'User not found' };
        }

        return {
            success: true,
            data: { avatarUrl: updatedUser.image },
        };
    } catch (error) {
        console.error('[updateUserAvatar] Error:', error);
        return {
            success: false,
            error: 'Failed to update avatar',
        };
    }
};
