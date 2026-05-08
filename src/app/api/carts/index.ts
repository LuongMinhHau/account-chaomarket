import { BaseResponse } from '@/types/base-response';
import { InferSelectModel } from 'drizzle-orm';
import { carts, cartItems, products, transactions } from '@/db/schema';

type Cart = InferSelectModel<typeof carts>;
type CartItem = InferSelectModel<typeof cartItems>;
type Product = InferSelectModel<typeof products>;
type Transaction = InferSelectModel<typeof transactions>;
type CheckoutResponse = Transaction & { checkoutUrl: string };

export type { Cart, CartItem, Product };

const API_BASE = '/api/carts';

const AddProductToCartServerAction = async (
    payload: { productId: string; quantity?: number; durationMonths?: number; plan?: string }[]
) => {
    const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    const data: BaseResponse<string> = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Failed to add products to cart');
    }
    return data;
};

const GetUserCartServerAction = async () => {
    const res = await fetch(`${API_BASE}/user`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    const data: BaseResponse<
        Cart & {
            items: (CartItem & { product: Product })[];
        }
    > = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Failed to get user cart');
    }
    return data;
};

const UserCheckoutServerAction = async (
    payload: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        message?: string;
        cartItemIds: string[];
    }
) => {
    const res = await fetch(`${API_BASE}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    const data: BaseResponse<CheckoutResponse> = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Failed to submit checkout');
    }
    return data;
};

const UserRemoveItemsFromCart = async (productIds: string[]) => {
    const res = await fetch(`${API_BASE}/items`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds }),
    });

    const data: BaseResponse<null> = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Failed to remove items from cart');
    }
    return data;
};

export const cartApis = {
    AddProductToCartServerAction,
    GetUserCartServerAction,
    UserCheckoutServerAction,
    UserRemoveItemsFromCart,
};
