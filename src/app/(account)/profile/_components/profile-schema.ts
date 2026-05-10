import { z } from 'zod';

/**
 * Profile form validation schema.
 * Extracted from ProfilePage for testability and reuse.
 */
export function createProfileSchema(t: (key: string) => string) {
    return z.object({
        email: z
            .string()
            .email(t('account.profilePage.emailInvalid')),
        name: z
            .string()
            .min(1, t('account.profilePage.nameRequired'))
            .max(100, t('account.profilePage.nameMax'))
            .regex(/^[\p{L}\s]+$/u, t('account.profilePage.nameLettersOnly')),
        phone: z
            .string()
            .optional()
            .refine(val => !val || /^[0-9+\-\s()]+$/.test(val), t('account.profilePage.phoneInvalid'))
            .refine(val => !val || val.replace(/[\s\-()]/g, '').length >= 9, t('account.profilePage.phoneMin'))
            .refine(val => !val || val.replace(/[\s\-()]/g, '').length <= 15, t('account.profilePage.phoneMax')),
        gender: z.enum(['male', 'female', 'other']).optional(),
        otherGender: z.string().max(50, t('account.profilePage.genderCustomMax')).optional(),
        dateOfBirth: z
            .string()
            .optional()
            .refine(val => {
                if (!val) return true;
                const d = new Date(val);
                return d.getFullYear() >= 1920;
            }, t('account.profilePage.dobInvalid'))
            .refine(val => {
                if (!val) return true;
                const d = new Date(val);
                const today = new Date();
                const age18 = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                return d <= age18;
            }, t('account.profilePage.dobMinAge')),
    }).refine(
        data => {
            if (data.gender === 'other') {
                return !!data.otherGender && data.otherGender.trim().length > 0;
            }
            return true;
        },
        {
            message: t('account.profilePage.genderRequired'),
            path: ['otherGender'],
        }
    );
}

export type ProfileFormData = z.infer<ReturnType<typeof createProfileSchema>>;

export interface ProfileData {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    gender: string | null;
    dateOfBirth: string | null;
    image: string | null;
    createdAt: string;
    emailVerified: string | null;
}
