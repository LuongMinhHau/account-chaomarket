import { z } from 'zod';

const bilingualContentSchema = z.object({
    en: z.string().nullable(),
    vi: z.string().nullable(),
});

const bilingualLabelSchema = z.object({
    en: z.string().min(1),
    vi: z.string().min(1),
});

export type CreateNewPost = z.infer<typeof createPostSchema>;

export const createPostSchema = z.object({
    content: bilingualContentSchema,
    referenceSource: z.url(),
    title: bilingualLabelSchema,
    description: bilingualContentSchema,
    type: z.enum(['insight', 'community']),
    slug: z.string().optional(),

    // SEO fields (optional)
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    seoKeywords: z.array(z.string()).optional(),
    ogImage: z.url().optional(),
    canonicalUrl: z.url().optional(),
    robots: z.string().optional(),
    tagIds: z.array(z.uuid()).optional(),
});

