import { z } from 'zod';

// Base user information schema
export const baseUserInfoSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    dateOfBirth: z.string(), // Will be made optional in profile schema
    email: z.email(),
    phoneNumber: z.string().min(1),
    socialNetwork: z.string().optional(),
    contactMethods: z.array(z.string()), // Will be made optional/min in different schemas
    message: z.string().optional(),
});

// Type for base user info
export type BaseUserInfo = z.infer<typeof baseUserInfoSchema>;
