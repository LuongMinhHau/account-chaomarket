import { z } from 'zod';

export const checkoutSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email'),
    phoneNumber: z.string().optional().default(''),
    message: z.string().optional(),
    cartItemIds: z.array(z.string()).min(1, 'At least one item is required'),
});
