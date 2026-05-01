import { z } from 'zod';
import { createPostSchema } from './create-post';

export type UpdatePost = z.infer<typeof updatePostSchema>;

export const updatePostSchema = createPostSchema.extend({});
