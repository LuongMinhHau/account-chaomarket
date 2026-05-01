import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/constant/pagination';
import { z } from 'zod';

export const zodPaginationSchema = {
    pageIndex: z
        .string()
        .default(DEFAULT_PAGE_INDEX.toString())
        .transform(val => parseInt(val))
        .refine(val => !isNaN(val) && val >= 0, {
            message: 'pageIndex must be a non-negative integer',
        }),
    pageSize: z
        .string()
        .default(DEFAULT_PAGE_SIZE.toString())
        .transform(val => parseInt(val))
        .refine(val => !isNaN(val) && val > 0, {
            message: 'pageSize must be a positive integer',
        }),
};

export const zodTimeStampModifiedSchema = {
    createdAt: z
        .string()
        .transform(val => (val ? new Date(val) : undefined))
        .optional(),
    updatedAt: z
        .string()
        .transform(val => (val ? new Date(val) : undefined))
        .optional(),
};
