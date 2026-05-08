'use client';

import LoadingComponent from '@/components/loading-spinner';
import CheckOutTransactionForm, {
    CheckoutFormData,
} from '@/app/(account)/cart/components/CheckOutTransactionForm';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, ShoppingCart, ChevronDown, X, Clock } from 'lucide-react';
import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';


import { useUserProfile } from '@/hooks/react-query/user';
import {
    useUserRemoveCartItem,
    useUserCheckout,
    useUserCartQuery,
} from '@/hooks/react-query/carts';
import { useI18n } from '@/context/i18n/context';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useCartStore } from '@/stores/cart.store';
import { CART_ACTIONS } from '@/stores/actions/cart.action';
import { useMergeGuestCart } from '@/hooks/react-query/carts/use-merge-guest-cart';
import { APP_QUERY_KEY } from '@/constant';

/* ─── Cart Item Type ─── */
interface CartItem {
    productId: string;
    product?: {
        name?: Record<string, string>;
        price?: string;
        type?: string;
        category?: string;
        shortDescription?: Record<string, string>;
        marketType?: string;
        durationMonths?: number;
        courseDuration?: Record<string, string>;
        pricingTiers?: { durationMonths: number; price: string; discountPrice: string | null }[];
    };
    url?: string;
    plan?: string;
    durationMonths?: number;
    _badgeNumber?: number;
}

/* ─── Helpers ─── */
const formatPrice = (price: string | number, _locale: string = 'en') => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (!numPrice) return '0 VND';
    return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        maximumFractionDigits: 0,
    }).format(numPrice) + ' VND';
};

const capitalizeWords = (str: string) =>
    str?.replace(/\b\w/g, c => c.toUpperCase()) || '';

/* ─── Main Page ─── */
export default function CartItemsPage() {
    const { data: response, isLoading: isCartLoading, SessionStatus } = useUserCartQuery();
    const isAuthenticated = SessionStatus === 'authenticated';
    const isSessionLoading = SessionStatus === 'loading';

    // Guest cart (localStorage via Zustand)
    const guestDispatch = useCartStore(state => state.dispatch);
    const guestItemIds = useCartStore(state => state.itemIds);
    // Guest services not available in Account - placeholder for future
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const guestServicesResponse: { data?: any[] } | undefined = undefined;
    const isGuestServicesLoading = false;

    // Auto-merge guest cart → server cart when user logs in and visits /cart
    useMergeGuestCart();

    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const hasAutoSelected = useRef(false);

    const { locale } = useI18n();
    const { open } = useSidebar();
    const queryClient = useQueryClient();

    // Profile hooks (only used when authenticated)
    const { profile, isProfileLoading } = useUserProfile();

    // Cart hooks (only used when authenticated)
    const removeCartItemMutation = useUserRemoveCartItem();
    const checkoutMutation = useUserCheckout();

    // Review mode — toggled when user clicks "Checkout"
    const [isReviewing, setIsReviewing] = useState(false);
    const [reviewFormData, setReviewFormData] = useState<CheckoutFormData | null>(null);

    // Build normalized cart items based on auth state
    const filteredItem = useMemo((): CartItem[] | undefined => {
        if (isAuthenticated) {
            // Auth: use server cart data (API returns items sorted oldest-first)
            return response?.data?.items?.map(item => ({
                ...item,
                url: undefined,
            })) as CartItem[] | undefined;
        } else {
            // Guest: Account doesn't have guest product browsing yet — return empty
            return [];
        }
    }, [isAuthenticated, response, guestServicesResponse, guestItemIds]);

    // Pre-select all items when cart data first loads (standard e-commerce flow)
    useEffect(() => {
        if (filteredItem && filteredItem.length > 0 && !hasAutoSelected.current) {
            setSelectedItems(filteredItem.map(item => item.productId));
            hasAutoSelected.current = true;
        }
    }, [filteredItem]);

    // Toggle selection of a single item
    const toggleItemSelection = useCallback((productId: string) => {
        setSelectedItems(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    }, []);

    // Toggle selection of all items
    const toggleSelectAll = () => {
        if (!filteredItem) return;
        if (selectedItems.length === filteredItem.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(filteredItem.map(item => item.productId));
        }
    };

    // Remove all items from cart (dual-mode)
    const removeAllItems = async () => {
        if (!filteredItem || filteredItem.length === 0) return;

        const allIds = filteredItem.map(item => item.productId);
        try {
            if (isAuthenticated) {
                await removeCartItemMutation.mutateAsync(allIds);
            } else {
                allIds.forEach((id: string) => {
                    guestDispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: id });
                });
            }
            setSelectedItems([]);
        } catch (error) {
            console.error('Error removing items:', error);
        }
    };

    // Remove a single item from cart
    const removeSingleItem = async (productId: string) => {
        try {
            if (isAuthenticated) {
                await removeCartItemMutation.mutateAsync([productId]);
            } else {
                guestDispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: productId });
            }
            setSelectedItems(prev => prev.filter(id => id !== productId));
        } catch (error) {
            console.error('Error removing item:', error);
        }
    };

    // Handle checkout submission (from review view)
    const handleSubmit = async (data: CheckoutFormData) => {
        try {
            const result = await checkoutMutation.mutateAsync({
                ...data,
                phoneNumber: data.phoneNumber || '',
                cartItemIds: selectedItems,
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const resultData = result.data as any;
            if (resultData?.checkoutUrl) {
                // Redirect to PayOS payment page
                window.location.href = resultData.checkoutUrl;
            }
        } catch {
            // Error handled by mutation
        }
    };

    const isChecked = useCallback(
        (productId: string) => selectedItems.includes(productId),
        [selectedItems]
    );

    // Loading states
    const isRemoving = removeCartItemMutation.isPending;
    const isCheckingOut = checkoutMutation.isPending;
    const isLoading = isSessionLoading || (isAuthenticated ? (isCartLoading || isProfileLoading) : isGuestServicesLoading);

    // Selected items data for review
    const selectedItemsData = filteredItem?.filter(item => selectedItems.includes(item.productId)) || [];
    const totalAmount = selectedItemsData.reduce((sum, item) => sum + parseFloat(item.product?.price || '0'), 0);

    if (isLoading || !filteredItem) return <LoadingComponent />;

    /* ═══════════════════════════════════════════════════════════
       ORDER REVIEW VIEW — shown after clicking "Checkout"
       ═══════════════════════════════════════════════════════════ */
    if (isReviewing) {
        return (
            <div
                className={cn(
                    'overflow-x-hidden flex flex-col gap-6 mx-auto w-full',
                    `${open ? 'lg:max-w-[calc(100svw-var(--sidebar-width)-7rem)]' : 'lg:max-w-[calc(100svw-var(--sidebar-width)+1rem)]'}`
                )}
            >
                {/* Back button */}
                <button
                    onClick={() => setIsReviewing(false)}
                    className="inline-flex items-center gap-1 transition-all mb-2 font-medium text-brand-text dark:text-white hover:font-bold cursor-pointer"
                >
                    ← {locale === 'vi' ? 'Quay lại' : 'Back to'}{' '}
                    <span className="dark:text-[var(--brand-color)]">
                        {locale === 'vi' ? 'Giỏ Hàng' : 'Cart'}
                    </span>
                </button>

                {/* Step indicator */}
                <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1.5 cursor-pointer group" onClick={() => setIsReviewing(false)}>
                        <div className="w-6 h-6 rounded-full bg-[var(--brand-color)] text-black text-xs font-bold flex items-center justify-center group-hover:scale-110 transition-transform">✓</div>
                        <span className="font-medium text-[var(--brand-grey-foreground)] group-hover:text-brand-text dark:group-hover:text-white transition-colors">
                            {locale === 'vi' ? 'Giỏ hàng' : 'Cart'}
                        </span>
                    </div>
                    <div className="w-8 h-px bg-[var(--brand-color)]" />
                    <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-[var(--brand-color)] text-black text-xs font-bold flex items-center justify-center">2</div>
                        <span className="font-semibold text-brand-text dark:text-white">
                            {locale === 'vi' ? 'Xác nhận' : 'Review'}
                        </span>
                    </div>
                    <div className="w-8 h-px bg-neutral-300 dark:bg-neutral-600" />
                    <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500 text-xs font-bold flex items-center justify-center">3</div>
                        <span className="font-medium text-neutral-400 dark:text-neutral-500">
                            {locale === 'vi' ? 'Thanh toán' : 'Payment'}
                        </span>
                    </div>
                </div>

                {/* Unified heading */}
                <div>
                    <h1 className="text-xl lg:text-2xl text-black dark:text-[var(--brand-color)] font-bold">
                        {locale === 'vi' ? 'Thông tin đơn hàng' : 'Order Information'}
                    </h1>
                    <p className="text-sm sm:text-base font-normal dark:text-white/90 mt-1">
                        {locale === 'vi'
                            ? 'Vui lòng kiểm tra lại thông tin trước khi xác nhận'
                            : 'Please review the details before confirming'}
                    </p>
                </div>

                {/* Two-column: items summary (left) + contact info read-only (right) */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: Order items — CARD */}
                    <div className="w-full lg:w-1/2 rounded-xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] p-5">
                        <h2 className="text-[20px] font-bold text-brand-text dark:text-white/90 mb-4 pb-3 border-b border-black/10 dark:border-white/10 flex items-center gap-2">
                            <ShoppingCart className="size-[22px]" />
                            {locale === 'vi'
                                ? `Đơn hàng (${selectedItemsData.length} sản phẩm)`
                                : `Order (${selectedItemsData.length} ${selectedItemsData.length === 1 ? 'item' : 'items'})`}
                        </h2>
                        <div className="space-y-2">
                            {selectedItemsData.map((item, idx) => (
                                <div
                                    key={item.productId}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/[0.02]"
                                >
                                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[var(--brand-color)] text-black text-[16px] font-bold flex items-center justify-center">
                                        #{idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[16px] font-semibold text-brand-text dark:text-white truncate">
                                            {item.product?.name?.[locale] || 'Product'}
                                        </p>
                                        <p className="text-xs text-[var(--brand-grey-foreground)] truncate">
                                            {item.plan && item.plan !== 'free' && (
                                                <span className="inline-block mr-1 px-1.5 py-0 rounded text-[10px] font-bold bg-[var(--brand-color)]/20 text-[var(--brand-color)]">
                                                    {item.plan.charAt(0).toUpperCase() + item.plan.slice(1)}
                                                </span>
                                            )}
                                            {item.product?.category || ''}
                                            {' · '}
                                            {item.durationMonths || 1}{' '}
                                            {locale === 'vi' ? 'tháng' : (item.durationMonths || 1) === 1 ? 'month' : 'months'}
                                        </p>
                                    </div>
                                    <span className="text-[16px] font-bold tabular-nums text-black dark:text-[var(--brand-color)] shrink-0">
                                        {formatPrice(item.product?.price || 0, locale)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10">
                            <div className="flex items-center justify-between px-1">
                                <span className="text-[20px] font-bold text-brand-text dark:text-white">
                                    {locale === 'vi' ? 'Tổng cộng' : 'Total'}
                                </span>
                                <span className="text-[20px] font-bold text-black dark:text-[var(--brand-color)] tabular-nums">
                                    {formatPrice(totalAmount, locale)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Contact info (READ-ONLY) — CARD */}
                    <div className="w-full lg:w-1/2 rounded-xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] p-5">
                        <h2 className="text-[20px] font-bold text-brand-text dark:text-white/90 mb-4 pb-3 border-b border-black/10 dark:border-white/10 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="size-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            {locale === 'vi' ? 'Thông tin liên hệ' : 'Contact Information'}
                        </h2>

                        {reviewFormData && (
                            <div className="space-y-4">
                                {/* Name */}
                                <div>
                                    <p className="text-[14px] text-[var(--brand-grey-foreground)] mb-1">
                                        {locale === 'vi' ? 'Họ tên' : 'Full Name'}
                                    </p>
                                    <p className="text-[18px] font-semibold text-brand-text dark:text-white">
                                        {locale === 'vi'
                                            ? `${reviewFormData.lastName} ${reviewFormData.firstName}`
                                            : `${reviewFormData.firstName} ${reviewFormData.lastName}`}
                                    </p>
                                </div>

                                {/* Phone */}
                                <div>
                                    <p className="text-[14px] text-[var(--brand-grey-foreground)] mb-1">
                                        {locale === 'vi' ? 'Số điện thoại' : 'Phone Number'}
                                    </p>
                                    <p className="text-[18px] font-semibold text-brand-text dark:text-white">
                                        {reviewFormData.phoneNumber}
                                    </p>
                                </div>

                                {/* Email */}
                                <div>
                                    <p className="text-[14px] text-[var(--brand-grey-foreground)] mb-1">Email</p>
                                    <p className="text-[18px] font-semibold text-brand-text dark:text-white">
                                        {reviewFormData.email}
                                    </p>
                                </div>

                                {/* Message */}
                                {reviewFormData.message && (
                                    <div>
                                        <p className="text-[14px] text-[var(--brand-grey-foreground)] mb-1">
                                            {locale === 'vi' ? 'Ghi chú' : 'Note'}
                                        </p>
                                        <p className="text-[17px] font-medium text-brand-text dark:text-white/90 whitespace-pre-wrap">
                                            {reviewFormData.message}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Confirm & Pay button — centered below */}
                <div className="flex justify-center pt-2">
                    <Button
                        onClick={() => reviewFormData && handleSubmit(reviewFormData)}
                        disabled={isCheckingOut}
                        className="h-12 px-12 text-[16px]! font-semibold rounded-lg bg-[var(--brand-color)] text-black border border-[var(--brand-color)] dark:border-black hover:bg-[var(--brand-color)]/90 hover:scale-[1.02] transition-all duration-300"
                    >
                        {isCheckingOut ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                {locale === 'vi' ? 'Đang xử lý...' : 'Processing...'}
                            </span>
                        ) : (locale === 'vi' ? 'Xác nhận và Thanh toán' : 'Confirm and Pay')}
                    </Button>
                </div>
            </div >
        );
    }

    /* ═══════════════════════════════════════════════════════════
       CART VIEW — the original two-column layout
       ═══════════════════════════════════════════════════════════ */
    return (
        <div
            className={cn(
                'overflow-x-hidden flex flex-col lg:flex-row gap-8 mx-auto w-full',
                `${open ? 'lg:max-w-[calc(100svw-var(--sidebar-width)-7rem)]' : 'lg:max-w-[calc(100svw-var(--sidebar-width)+1rem)]'}`
            )}
        >
            {/* ═══ Cart Items ═══ */}
            <div className="w-full lg:w-1/2 max-w-full lg:max-w-1/2 overflow-hidden">
                <div className="w-full flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-lg lg:text-xl text-black dark:text-[var(--brand-color)] font-bold">
                            {locale === 'vi' ? 'Giỏ hàng' : 'Your Cart'}{' '}
                            <span className="text-black dark:text-[var(--brand-color)] font-bold">({filteredItem.length})</span>
                        </h1>
                        <p className="text-sm sm:text-base font-normal dark:text-white/90">
                            {locale === 'vi'
                                ? 'Quản lý sản phẩm và hoàn tất đơn hàng'
                                : 'Manage your products and complete checkout'}
                        </p>
                    </div>
                </div>

                {/* Select All + Remove row */}
                {filteredItem.length > 0 && (
                    <div className="flex items-center justify-between mb-4 px-4">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="select-all"
                                checked={
                                    selectedItems.length === filteredItem.length &&
                                    filteredItem.length > 0
                                }
                                onCheckedChange={toggleSelectAll}
                                className="data-[state=checked]:bg-transparent data-[state=checked]:border-black data-[state=checked]:text-black dark:data-[state=checked]:bg-transparent dark:data-[state=checked]:border-white dark:data-[state=checked]:text-white cursor-pointer border-[var(--brand-grey-foreground)] focus-visible:ring-0 focus:ring-0 focus:ring-offset-0 shadow-none outline-none"
                            />
                            <label
                                htmlFor="select-all"
                                className="text-sm font-medium text-brand-text dark:text-white/80 cursor-pointer"
                            >
                                {locale === 'vi' ? 'Chọn tất cả' : 'Select All'}
                            </label>
                        </div>

                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={removeAllItems}
                            disabled={!filteredItem || filteredItem.length === 0 || isRemoving}
                            className="h-8 px-3 gap-1 text-sm font-medium text-brand-text dark:text-white/80 rounded-lg transition-all! duration-300 hover:font-semibold disabled:opacity-40"
                        >
                            {isRemoving ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                                    {locale === 'vi' ? 'Xóa tất cả' : 'Remove All'}
                                </>
                            )}
                        </Button>
                    </div>
                )}

                {/* Cart items list */}
                <CartItemsList
                    filteredItem={filteredItem}
                    isChecked={isChecked}
                    toggleItemSelection={toggleItemSelection}
                    onRemoveItem={removeSingleItem}
                    locale={locale}
                    onDurationChange={async (productId, durationMonths) => {
                        if (!isAuthenticated) return;
                        try {
                            await fetch('/api/carts/items/duration', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ productId, durationMonths }),
                            });
                            queryClient.invalidateQueries({ queryKey: [APP_QUERY_KEY.USER_CART] });
                        } catch (e) {
                            console.error('Failed to update duration:', e);
                        }
                    }}
                />

                {/* ═══ Total ═══ */}
                {filteredItem && filteredItem.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10">
                        <div className="flex items-center justify-between">
                            <span className="text-[16px] font-semibold text-brand-text dark:text-white/90">
                                {selectedItems.length > 0
                                    ? `${locale === 'vi' ? 'Tổng cộng' : 'Total'} (${selectedItems.length} ${locale === 'vi' ? 'sản phẩm' : selectedItems.length === 1 ? 'item' : 'items'})`
                                    : (locale === 'vi' ? 'Chọn sản phẩm để xem tổng' : 'Select items to see total')
                                }
                            </span>
                            {selectedItems.length > 0 && (
                                <span className="text-[20px] font-bold text-black dark:text-[var(--brand-color)] tabular-nums">
                                    {formatPrice(totalAmount, locale)}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ═══ Divider ═══ */}
            <div className="hidden lg:block w-px bg-black/10 dark:bg-border self-stretch" />

            {/* ═══ Checkout Form or Guest Login Banner ═══ */}
            <div className="w-full lg:w-1/2 max-w-full lg:max-w-1/2 flex flex-col overflow-hidden">
                {isAuthenticated ? (
                    <>
                        {/* Section heading */}
                        <div className="mb-6">
                            <h1 className="text-lg lg:text-xl text-brand-text dark:text-[var(--brand-color)] font-bold">
                                {locale === 'vi' ? 'Thanh toán' : 'Checkout'}
                            </h1>
                            <p className="text-sm sm:text-base font-normal dark:text-white/90">
                                {locale === 'vi'
                                    ? 'Hoàn tất thông tin để xác nhận đơn hàng'
                                    : 'Complete your details to confirm your order'}
                            </p>
                        </div>
                        <CheckOutTransactionForm
                            onSubmit={async (data) => {
                                setReviewFormData(data);
                                setIsReviewing(true);
                            }}
                            isDisableSubmitButton={
                                selectedItems.length === 0 || isCheckingOut
                            }
                            initialData={profile}
                        />
                    </>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="mb-6">
                            <h1 className="text-lg lg:text-xl text-brand-text dark:text-[var(--brand-color)] font-bold">
                                {locale === 'vi' ? 'Thanh toán' : 'Checkout'}
                            </h1>
                            <p className="text-sm sm:text-base font-normal dark:text-white/90">
                                {locale === 'vi'
                                    ? 'Hoàn tất thông tin để xác nhận đơn hàng'
                                    : 'Complete your details to confirm your order'}
                            </p>
                        </div>
                        <p className="font-semibold text-[16px] text-[var(--brand-grey-foreground)] dark:text-white/70">
                            {locale === 'vi'
                                ? 'Bạn cần đăng nhập để hoàn tất đơn hàng.'
                                : 'You need to log in to complete your order.'}
                        </p>
                        <div className="flex items-center gap-3 flex-wrap">
                            <Button
                                onClick={() => signIn(undefined, { callbackUrl: '/cart' })}
                                className="h-10 px-6 text-[15px] font-semibold rounded-lg bg-[var(--brand-color)] text-black border border-[var(--brand-color)] hover:bg-[var(--brand-color)]/90 hover:scale-105 transition-all duration-300"
                            >
                                {locale === 'vi' ? 'Đăng nhập ngay' : 'Log In Now'}
                            </Button>
                        </div>
                        <p className="text-[14px] text-[var(--brand-grey-foreground)]">
                            {locale === 'vi' ? 'Chưa có tài khoản? ' : "Don't have an account? "}
                            <button
                                onClick={() => signIn(undefined, { callbackUrl: '/cart' })}
                                className="font-semibold text-brand-text dark:text-[var(--brand-color)] hover:font-bold cursor-pointer"
                            >
                                {locale === 'vi' ? 'Đăng ký' : 'Register'}
                            </button>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ═══ Cart Items List ═══ */
function CartItemsList({
    filteredItem,
    isChecked,
    toggleItemSelection,
    onRemoveItem,
    locale,
    onDurationChange,
}: {
    filteredItem: CartItem[];
    isChecked: (id: string) => boolean;
    toggleItemSelection: (id: string) => void;
    onRemoveItem: (id: string) => void;
    locale: string;
    onDurationChange?: (productId: string, durationMonths: number) => void;
}) {
    // Assign badge numbers: selected items get sequential 1, 2, 3...; unselected get 0
    let selectedCounter = 0;
    const allItems = filteredItem.map(item => {
        const checked = isChecked(item.productId);
        return { ...item, _badgeNumber: checked ? ++selectedCounter : 0 };
    });
    const selectedItems = allItems.filter(item => isChecked(item.productId));
    const unselectedItems = allItems.filter(item => !isChecked(item.productId));
    const [showMore, setShowMore] = useState(false);

    if (filteredItem.length === 0) {
        return (
            <div className="text-center flex flex-col gap-4 items-center justify-center py-8 text-[var(--brand-grey-foreground)]">
                <div className="w-24 h-24 rounded-full bg-[var(--brand-color)] grid place-items-center">
                    <ShoppingCart className="w-14 h-14 text-black" strokeWidth={1.5} />
                </div>
                <p className="font-semibold text-[16px] dark:text-white/70">
                    {locale === 'vi'
                        ? 'Giỏ hàng trống.'
                        : 'Your cart is empty.'}
                </p>
                <Link
                    href="/"
                    className="text-[16px] font-semibold text-black dark:text-[var(--brand-color)] hover:font-bold transition-all"
                >
                    {locale === 'vi' ? 'Khám phá Sản Phẩm →' : 'Browse Products →'}
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-3 px-4">
            {/* Selected items */}
            {selectedItems.map(item => (
                <CartItemCard
                    key={item.productId}
                    item={item}
                    checked={true}
                    onToggle={() => toggleItemSelection(item.productId)}
                    onRemove={() => onRemoveItem(item.productId)}
                    locale={locale}
                    badgeNumber={item._badgeNumber}
                    onDurationChange={onDurationChange}
                />
            ))}

            {/* Unselected items */}
            {unselectedItems.length > 0 && selectedItems.length > 0 && (
                <>
                    <button
                        onClick={() => setShowMore(!showMore)}
                        className="w-fit mx-auto flex items-center justify-center gap-2 py-1 px-2.5 text-[14px] font-medium text-black/90 dark:text-[var(--brand-color)] bg-transparent border-0 rounded-lg hover:font-semibold transition-all duration-200 cursor-pointer"
                    >
                        {showMore
                            ? (locale === 'vi' ? 'Thu gọn' : 'Show less')
                            : (locale === 'vi'
                                ? `Xem thêm ${unselectedItems.length} sản phẩm khác`
                                : `Show ${unselectedItems.length} more item${unselectedItems.length > 1 ? 's' : ''}`)}
                        <ChevronDown className={cn(
                            'size-4 transition-transform duration-200',
                            showMore && 'rotate-180'
                        )} />
                    </button>

                    {showMore && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            {unselectedItems.map(item => (
                                <CartItemCard
                                    key={item.productId}
                                    item={item}
                                    checked={false}
                                    onToggle={() => toggleItemSelection(item.productId)}
                                    onRemove={() => onRemoveItem(item.productId)}
                                    locale={locale}
                                    badgeNumber={item._badgeNumber}
                                    onDurationChange={onDurationChange}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* If no selected items, show all unselected directly */}
            {selectedItems.length === 0 && unselectedItems.map(item => (
                <CartItemCard
                    key={item.productId}
                    item={item}
                    checked={false}
                    onToggle={() => toggleItemSelection(item.productId)}
                    onRemove={() => onRemoveItem(item.productId)}
                    locale={locale}
                    badgeNumber={item._badgeNumber}
                    onDurationChange={onDurationChange}
                />
            ))}

            {/* Browse Products link — always visible */}
            <Link
                href="/"
                className="w-fit mx-auto flex items-center justify-center gap-2 py-1 px-2.5 text-[16px] font-medium text-black dark:text-[var(--brand-color)] bg-transparent border-0 rounded-lg hover:font-semibold transition-all duration-200"
            >
                {locale === 'vi' ? 'Khám phá Sản Phẩm' : 'Browse Products'} →
            </Link>
        </div>
    );
}

/* ═══ Cart Item Card ═══ */
function CartItemCard({
    item,
    checked,
    onToggle,
    onRemove,
    locale,
    badgeNumber,
    onDurationChange,
}: {
    item: CartItem;
    checked: boolean;
    onToggle: () => void;
    onRemove: () => void;
    locale: string;
    badgeNumber: number;
    onDurationChange?: (productId: string, durationMonths: number) => void;
}) {
    const service = item.product;
    const name = (service?.name as Record<string, string>)?.[locale] || 'Product';
    const description = (service?.shortDescription as Record<string, string>)?.[locale] || '';
    const type = service?.type || 'Holistic';
    const marketType = service?.marketType || '';

    // Pricing tiers from API (sorted by duration)
    const tiers: { durationMonths: number; price: string; discountPrice: string | null }[] =
        (service?.pricingTiers || []).sort((a: { durationMonths: number }, b: { durationMonths: number }) => a.durationMonths - b.durationMonths);

    // Current duration from cart item (or service default)
    const currentDuration = item.durationMonths || service?.durationMonths || 1;
    const [selectedDuration, setSelectedDuration] = useState(currentDuration);

    // Find the active tier's price
    const activeTier = tiers.find((t) => t.durationMonths === selectedDuration);
    const displayPrice = activeTier
        ? (activeTier.discountPrice || activeTier.price)
        : (service?.price || '0');

    const typeMap: Record<string, Record<string, string>> = {
        course: { en: 'Course', vi: 'Khóa Học' },
        tool: { en: 'Tool', vi: 'Công Cụ' },
        signal: { en: 'Signal', vi: 'Tín Hiệu' },
        indicator: { en: 'Indicator', vi: 'Chỉ Báo' },
        holistic: { en: 'Holistic', vi: 'Toàn Diện' },
    };

    const typeKey = type?.toLowerCase() || 'holistic';
    const typeLabel = typeMap[typeKey]?.[locale] || capitalizeWords(type);

    const handleDurationChange = (duration: number) => {
        if (duration === selectedDuration) return;
        setSelectedDuration(duration);
        onDurationChange?.(item.productId, duration);
    };

    // Duration pill labels
    const durationLabel = (months: number) => {
        if (months >= 12 && months % 12 === 0) return `${months / 12}Y`;
        return `${months}M`;
    };

    return (
        <div
            className={cn(
                'relative grid grid-cols-[auto_auto_1fr] items-center border rounded-lg bg-[var(--brand-grey)] pl-3 pr-8 py-2 shadow-sm transition-all duration-300 ease-in-out gap-3 cursor-pointer',
                checked
                    ? 'border-brand-text dark:border-white/20'
                    : 'border-transparent opacity-80 hover:opacity-100 hover:border-black/10 dark:hover:border-white/10'
            )}
            onClick={onToggle}
        >
            {/* Remove button — top right */}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                className="absolute top-1.5 right-1.5 p-0.5 rounded-full opacity-60 hover:opacity-100 hover:bg-[var(--brand-grey)] transition-all duration-200 cursor-pointer"
                aria-label="Remove item"
            >
                <X className="size-3.5" />
            </button>

            {/* Checkbox */}
            <Checkbox
                id={`cart-item-${item.productId}`}
                checked={checked}
                className="shrink-0 data-[state=checked]:bg-transparent data-[state=checked]:border-black data-[state=checked]:text-black dark:data-[state=checked]:bg-transparent dark:data-[state=checked]:border-white dark:data-[state=checked]:text-white cursor-pointer border-[var(--brand-grey-foreground)] focus-visible:ring-0 focus:ring-0 focus:ring-offset-0 shadow-none outline-none"
            />

            {/* Number Badge */}
            <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-black dark:text-white font-semibold text-[16px]">
                {badgeNumber > 0 ? String(badgeNumber).padStart(2, '0') : ''}
            </span>

            {/* Product info */}
            <div className="flex flex-col gap-1 min-w-0 overflow-hidden">
                {/* Title + Type • Market row */}
                <div className="flex items-center gap-2">
                    {item.url ? (
                        <Link
                            href={item.url}
                            className="font-semibold text-[18px] text-brand-text dark:text-white hover:font-bold truncate min-w-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {name}
                        </Link>
                    ) : (
                        <h3 className="font-semibold text-[18px] text-brand-text dark:text-white truncate min-w-0">
                            {name}
                        </h3>
                    )}
                    <span className="text-brand-text/30 dark:text-white/20 shrink-0">·</span>
                    <span className="text-[13px] font-semibold text-[var(--brand-grey-foreground)] shrink-0">
                        {typeLabel}{marketType ? ` • ${marketType.charAt(0).toUpperCase() + marketType.slice(1).toLowerCase()}` : ''}
                    </span>
                    {item.plan && item.plan !== 'free' && (
                        <>
                            <span className="text-brand-text/30 dark:text-white/20 shrink-0">·</span>
                            <span className="inline-block px-1.5 py-0 rounded text-[11px] font-bold bg-[var(--brand-color)]/20 text-[var(--brand-color)] shrink-0">
                                {item.plan.charAt(0).toUpperCase() + item.plan.slice(1)}
                            </span>
                        </>
                    )}
                </div>

                {/* Description */}
                {description && (
                    <p className="text-[14px] font-medium text-black/90 dark:text-white/80 truncate">
                        {description}
                    </p>
                )}

                {/* Duration + Price row (last row) */}
                <div className="flex items-center justify-between gap-2 mt-2">
                    {/* Duration pills or static text */}
                    {tiers.length > 0 ? (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {tiers.map((tier) => (
                                <button
                                    key={tier.durationMonths}
                                    type="button"
                                    onClick={() => handleDurationChange(tier.durationMonths)}
                                    className={cn(
                                        'px-2.5 py-0.5 rounded-md text-[12px] font-bold transition-all duration-200 cursor-pointer border',
                                        selectedDuration === tier.durationMonths
                                            ? 'bg-[var(--brand-color)] text-black border-[var(--brand-color)]'
                                            : 'bg-transparent text-[var(--brand-grey-foreground)] border-black/10 dark:border-white/10 hover:border-[var(--brand-color)] hover:text-[var(--brand-color)]'
                                    )}
                                >
                                    {durationLabel(tier.durationMonths)}
                                </button>
                            ))}
                        </div>
                    ) : service?.courseDuration ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.06]">
                            <Clock className="w-3.5 h-3.5 text-[var(--brand-grey-foreground)] shrink-0" />
                            <span className="text-[12px] font-semibold text-brand-text dark:text-white">
                                {(service.courseDuration as Record<string, string>)?.[locale] || (service.courseDuration as Record<string, string>)?.en || ''}
                            </span>
                        </span>
                    ) : (
                        <span />
                    )}

                    {/* Price */}
                    <span className="text-[18px] font-bold text-black dark:text-[var(--brand-color)] shrink-0">
                        {formatPrice(displayPrice, locale)}
                    </span>
                </div>
            </div>
        </div>
    );
}

