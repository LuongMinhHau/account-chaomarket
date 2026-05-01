import { z } from 'zod';
import type { BilingualLabel, BilingualContent } from '@/db/schema/db-types';

export interface CreateNewProduct {
    name: BilingualLabel;
    description: BilingualContent;
    price: string;
    type: string;
    category?: string;
    imageUrl: string | null;
    stock: number | null;
}

const bilingualLabelSchema = z.object({
    en: z.string().min(1, 'English name is required'),
    vi: z.string().min(1, 'Vietnamese name is required'),
});

const bilingualContentSchema = z.object({
    en: z.string().nullable(),
    vi: z.string().nullable(),
});

export const newProductSchema = z.object({
    name: bilingualLabelSchema,
    description: bilingualContentSchema,
    price: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Price must be a positive number'),
    type: z.string().min(1, 'Type is required'),
    category: z.string().optional(),
    stock: z
        .number()
        .int()
        .nonnegative('Stock must be a non-negative integer')
        .nullable(),
    imageUrl: z.string().url('Must be a valid URL').nullable(),
});

