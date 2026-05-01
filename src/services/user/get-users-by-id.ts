'use server';

import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { UserViewResponse } from '@/types/user/response/view-response';
import { users } from '@/db/schema';

export const getUsersById = async (
    id: string
): Promise<UserViewResponse | null> => {
    if (!id || typeof id !== 'string') {
        return null;
    }

    try {
        const user = await db
            .select({
                name: users.name,
                email: users.email,
                image: users.image,
                gender: users.gender,
                phone: users.phone,
                dateOfBirth: users.dateOfBirth,
                createdAt: users.createdAt,
                emailVerified: users.emailVerified,
            })
            .from(users)
            .where(eq(users.id, id))
            .limit(1)
            .then(res => res[0] || null); // return null if not found

        return user;
    } catch (error) {
        console.error('Failed to fetch user by ID:', error);
        return null;
    }
};
