import { z } from 'zod';

const addAProductToCartSchema = z.object({
    productId: z.string().uuid('Invalid product ID format'),
    quantity: z.number().int().positive('Quantity must be a positive integer'),
    durationMonths: z.number().int().positive().optional(),
    plan: z.string().optional(),
});

export const addProductsToCartSchema = z
    .array(addAProductToCartSchema)
    .nonempty();
