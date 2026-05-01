import { User } from '@/db/schema';

export type UserViewResponse = Pick<
    User,
    | 'name'
    | 'email'
    | 'createdAt'
    | 'phone'
    | 'dateOfBirth'
    | 'gender'
    | 'image'
    | 'emailVerified'
>;
