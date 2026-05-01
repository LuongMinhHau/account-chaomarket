import { zodPaginationSchema, zodTimeStampModifiedSchema } from '@/schema/zod';
import { z } from 'zod';

export type PostRequestParams = z.infer<typeof postQuerySchema>;

export const postQuerySchema = z.object({
    ...zodPaginationSchema,
    createdAt: zodTimeStampModifiedSchema.createdAt,
    createdAtEnd: zodTimeStampModifiedSchema.createdAt,
    type: z
        .union([
            z.enum(['insight', 'community']),
            z.array(z.enum(['insight', 'community'])),
        ])
        .optional(),
    filterBy: z
        .enum(['all', 'recommended', 'mostViewed', 'topRated'])
        .optional(),
    sortBy: z.enum(['asc', 'desc', 'featured']).optional(),
    market: z.string().optional(),
    search: z.string().optional(),
    mainTag: z.string().optional(),
    xUid: z.string().optional(),
    xGuestId: z.string().optional(),
});
