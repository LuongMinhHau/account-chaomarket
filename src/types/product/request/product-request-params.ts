import { zodPaginationSchema } from '@/schema/zod';
import { PaginationRequest } from '@/types/pagination';
import { z } from 'zod';

export interface ProductRequestParams extends PaginationRequest {
    name?: string;
    price?: string;
}

export const productQuerySchema = z.object({
    name: z.string().optional(),
    price: z
        .string()
        .regex(/^\d+(\.\d{1,2})?$/)
        .optional(),
    ...zodPaginationSchema,
});
