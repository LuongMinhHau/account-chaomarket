import { CreateNewProduct, newProductSchema } from './create-product';

export type UpdateProduct = Partial<CreateNewProduct>;

export const updateProductSchema = newProductSchema.partial();
