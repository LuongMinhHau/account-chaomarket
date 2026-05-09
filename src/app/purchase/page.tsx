'use client';

import { useEffect, useState, Suspense, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/context/i18n/context';
import Link from 'next/link';
import TabAuthMode from '@/app/auth/components/tab-auth-mode';

/* ─── Types ─── */
interface PaymentData {
    checkoutUrl: string;
    orderCode: number;
    qrCode: string;
    bin: string;
    accountNumber: string;
    accountName: string;
    amount: number;
    description: string;
    expiredAt: string;
    product: {
        name: Record<string, string>;
        price: number;
        plan: string;
        durationMonths: number;
    };
}

/* ─── Helpers ─── */
const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
};

const formatOrderCode = (code: number | string): string => {
    return `#${String(code)}`;
};

const getBankName = (bin: string): string => {
    const banks: Record<string, string> = {
        '970422': 'MB Bank',
        '970415': 'VietinBank',
        '970436': 'Vietcombank',
        '970418': 'BIDV',
        '970407': 'Techcombank',
        '970416': 'ACB',
        '970432': 'VPBank',
        '970423': 'TPBank',
        '970403': 'Sacombank',
        '970405': 'Agribank',
        '970448': 'OCB',
        '970437': 'HDBank',
        '970441': 'VIB',
        '970443': 'SHB',
        '970431': 'Eximbank',
        '970426': 'MSB',
        '970406': 'DongA Bank',
        '970449': 'LPBank',
        '970412': 'PVcomBank',
        '970429': 'SCB',
    };
    return banks[bin] || `Bank (${bin})`;
};

/* ─── Main Component ─── */
function PurchaseGateway() {
    const { status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { locale } = useI18n();

    const productId = searchParams.get('productId');
    const source = searchParams.get('source') || 'unknown';
    const plan = searchParams.get('plan') || 'free';
    const duration = searchParams.get('duration') || '1';

    // State
    const [isCreating, setIsCreating] = useState(false);
    const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<'account' | 'amount' | 'code' | 'desc' | null>(null);
    const [productName, setProductName] = useState<string | null>(null);
    const [productLoading, setProductLoading] = useState(!!productId);
    const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PAID' | 'CANCELLED'>('PENDING');

    // Ref to prevent duplicate order creation (StrictMode / refresh)
    const orderCreatedRef = useRef(false);

    // Fetch product name for unauthenticated view
    useEffect(() => {
        if (productId) {
            fetch(`/api/products/${productId}`)
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data?.name) {
                        setProductName(data.name[locale] || data.name.vi || data.name.en);
                    }
                })
                .catch(() => {})
                .finally(() => setProductLoading(false));
        }
    }, [productId, locale]);

    // Create order + get PayOS payment data
    useEffect(() => {
        if (status === 'authenticated' && productId && !isCreating && !paymentData && !orderCreatedRef.current && !error) {
            orderCreatedRef.current = true;
            setIsCreating(true);
            fetch('/api/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    durationMonths: parseInt(duration),
                    plan,
                }),
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.data?.qrCode) {
                        setPaymentData(data.data);
                        // Clean URL — enterprise pattern (params stored in state)
                        router.replace('/purchase', { scroll: false });
                    } else if (data.success && data.data?.checkoutUrl) {
                        // Fallback: redirect if no QR
                        window.location.href = data.data.checkoutUrl;
                    } else {
                        setError(data.error?.message || 'Failed to create order');
                        orderCreatedRef.current = false; // allow retry
                    }
                })
                .catch(() => {
                    setError('Network error');
                    orderCreatedRef.current = false; // allow retry
                })
                .finally(() => setIsCreating(false));
        }
    }, [status, productId]);

    // Poll payment status every 3s
    useEffect(() => {
        if (!paymentData || paymentStatus !== 'PENDING') return;

        const interval = setInterval(() => {
            fetch(`/api/payos/verify?orderCode=${paymentData.orderCode}`)
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'PAID') {
                        setPaymentStatus('PAID');
                        router.push(`/order/complete?orderCode=${paymentData.orderCode}&status=success`);
                    } else if (data.status === 'CANCELLED') {
                        setPaymentStatus('CANCELLED');
                    }
                })
                .catch(() => {});
        }, 3000);

        return () => clearInterval(interval);
    }, [paymentData, paymentStatus, router]);

    // Copy helper
    const copyToClipboard = useCallback((text: string, field: 'account' | 'amount' | 'code' | 'desc') => {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
    }, []);

    // ═══ LOADING STATE ═══
    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-color)] mb-4" />
                <p className="text-[var(--brand-grey-foreground)] text-sm">
                    {locale === 'vi' ? 'Đang xác thực...' : 'Authenticating...'}
                </p>
            </div>
        );
    }

    // ═══ NO PRODUCT ID ═══
    if (!productId) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-red-500/10 grid place-items-center mb-6">
                    <span className="text-red-500 text-2xl font-bold">!</span>
                </div>
                <p className="text-brand-text dark:text-white font-semibold text-[16px] mb-2">
                    {locale === 'vi' ? 'Không Tìm Thấy Sản Phẩm' : 'Product Not Found'}
                </p>
                <p className="text-[var(--brand-grey-foreground)] text-sm mb-6">
                    {locale === 'vi'
                        ? 'Vui lòng quay lại và chọn sản phẩm để mua.'
                        : 'Please go back and select a product to purchase.'}
                </p>
                <button
                    onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/'}
                    className="text-[var(--brand-grey-foreground)] font-semibold hover:text-brand-text dark:hover:text-[var(--brand-color)] hover:underline transition-all cursor-pointer"
                >
                    ← {locale === 'vi' ? 'Quay lại' : 'Go back'}
                </button>
            </div>
        );
    }

    // ═══ CREATING ORDER STATE ═══
    if (status === 'authenticated' && (isCreating || (!paymentData && !error))) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--brand-color)] mb-6" />
                <p className="text-brand-text dark:text-white font-semibold text-[16px] mb-1">
                    {locale === 'vi' ? 'Đang Tạo Đơn Hàng...' : 'Creating Your Order...'}
                </p>
                <p className="text-[var(--brand-grey-foreground)] text-sm">
                    {locale === 'vi'
                        ? 'Vui lòng chờ trong giây lát.'
                        : 'Please wait a moment.'}
                </p>
            </div>
        );
    }

    // ═══ ERROR STATE ═══
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mx-auto w-14 h-14 rounded-full bg-red-500/10 grid place-items-center mb-6">
                    <span className="text-red-500 text-2xl font-bold">!</span>
                </div>
                <p className="text-brand-text dark:text-white font-semibold text-[16px] mb-2">
                    {locale === 'vi' ? 'Không Thể Tạo Đơn Hàng' : 'Failed To Create Order'}
                </p>
                <p className="text-[var(--brand-grey-foreground)] text-sm mb-6">{error}</p>
                <Button
                    onClick={() => window.location.reload()}
                    className="h-10 px-6 text-[16px]! font-semibold rounded-lg bg-[var(--brand-color)] text-black border border-[var(--brand-color)] dark:border-black hover:bg-[var(--brand-color)]/90 transition-all duration-300"
                >
                    {locale === 'vi' ? 'Thử lại' : 'Try Again'}
                </Button>
            </div>
        );
    }

    // ═══ EMBEDDED CHECKOUT (AUTHENTICATED + PAYMENT DATA) ═══
    if (paymentData) {
        const pName = paymentData.product.name[locale] || paymentData.product.name.vi || paymentData.product.name.en || 'Product';

        return (
            <div className="flex flex-col w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl lg:text-3xl font-bold text-brand-text dark:text-[var(--brand-color)]">
                        {locale === 'vi' ? 'Thanh Toán Đơn Hàng' : 'Order Payment'}
                    </h1>
                    <p className="text-[var(--brand-grey-foreground)] text-[16px] mt-2">
                        {locale === 'vi'
                            ? 'Quét mã QR hoặc chuyển khoản để hoàn tất thanh toán'
                            : 'Scan QR code or transfer to complete payment'}
                    </p>
                </div>

                {/* 2-column layout */}
                <div className="flex flex-col md:flex-row gap-6">

                    {/* LEFT: QR Code */}
                    <div className="w-full md:w-1/2 rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] p-6 flex flex-col items-center justify-center">
                        <div className="bg-white rounded-xl p-3 shadow-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={paymentData.qrCode}
                                alt="QR Code"
                                width={220}
                                height={220}
                                className="w-[220px] h-[220px]"
                            />
                        </div>
                        <p className="text-[28px] font-bold text-brand-text dark:text-[var(--brand-color)] mt-4 tabular-nums">
                            {formatPrice(paymentData.amount)}
                        </p>
                        <p className="text-[14px] text-[var(--brand-grey-foreground)] mt-1">
                            {locale === 'vi' ? 'Quét mã QR để thanh toán' : 'Scan QR to pay'}
                        </p>
                    </div>

                    {/* RIGHT: Order Info + Bank Transfer */}
                    <div className="w-full md:w-1/2 flex flex-col gap-4">

                        {/* Order Info */}
                        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] overflow-hidden">
                            <div className="px-5 py-3 border-b border-black/5 dark:border-white/5">
                                <p className="text-[13px] uppercase tracking-wider text-[var(--brand-grey-foreground)] font-medium">
                                    {locale === 'vi' ? 'Đơn hàng' : 'Order'}
                                </p>
                            </div>
                            <div className="p-5 space-y-3">
                                {/* Product */}
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0 mr-3">
                                        <p className="font-semibold text-brand-text dark:text-white text-[17px] truncate">
                                            {pName}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5 text-[14px] text-[var(--brand-grey-foreground)]">
                                            {paymentData.product.plan !== 'free' && (
                                                <span className="inline-block px-1.5 py-0.5 rounded text-[12px] font-bold bg-[var(--brand-color)]/20 text-[var(--brand-color)]">
                                                    {paymentData.product.plan.charAt(0).toUpperCase() + paymentData.product.plan.slice(1)}
                                                </span>
                                            )}
                                            <span>
                                                {paymentData.product.durationMonths}{' '}
                                                {locale === 'vi' ? 'tháng' : paymentData.product.durationMonths === 1 ? 'month' : 'months'}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-[18px] font-bold text-brand-text dark:text-[var(--brand-color)] tabular-nums shrink-0">
                                        {formatPrice(paymentData.amount)}
                                    </p>
                                </div>

                                {/* Order Code */}
                                <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
                                    <span className="text-[16px] text-[var(--brand-grey-foreground)]">
                                        {locale === 'vi' ? 'Mã đơn' : 'Order code'}
                                    </span>
                                    <button
                                        onClick={() => copyToClipboard(String(paymentData.orderCode), 'code')}
                                        className="flex items-center gap-1.5 text-[16px] font-semibold text-brand-text dark:text-white cursor-pointer hover:text-[var(--brand-color)] transition-colors"
                                    >
                                        {formatOrderCode(paymentData.orderCode)}
                                        {copied === 'code'
                                            ? <Check className="w-3.5 h-3.5 text-[var(--brand-color)]" />
                                            : <Copy className="w-3.5 h-3.5 opacity-40" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Bank Transfer Info */}
                        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] overflow-hidden">
                            <div className="px-5 py-3 border-b border-black/5 dark:border-white/5">
                                <p className="text-[13px] uppercase tracking-wider text-[var(--brand-grey-foreground)] font-medium">
                                    {locale === 'vi' ? 'Chuyển khoản ngân hàng' : 'Bank Transfer'}
                                </p>
                            </div>
                            <div className="p-5 space-y-3">
                                <div className="flex items-center justify-between text-[16px]">
                                    <span className="text-[var(--brand-grey-foreground)]">
                                        {locale === 'vi' ? 'Ngân hàng' : 'Bank'}
                                    </span>
                                    <span className="font-semibold text-brand-text dark:text-white">
                                        {getBankName(paymentData.bin)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-[16px]">
                                    <span className="text-[var(--brand-grey-foreground)]">
                                        {locale === 'vi' ? 'Số tài khoản' : 'Account'}
                                    </span>
                                    <button
                                        onClick={() => copyToClipboard(paymentData.accountNumber, 'account')}
                                        className="flex items-center gap-1.5 font-semibold text-brand-text dark:text-white cursor-pointer hover:text-[var(--brand-color)] transition-colors"
                                    >
                                        {paymentData.accountNumber}
                                        {copied === 'account'
                                            ? <Check className="w-3.5 h-3.5 text-[var(--brand-color)]" />
                                            : <Copy className="w-3.5 h-3.5 opacity-40" />}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between text-[16px]">
                                    <span className="text-[var(--brand-grey-foreground)]">
                                        {locale === 'vi' ? 'Chủ TK' : 'Name'}
                                    </span>
                                    <span className="font-semibold text-brand-text dark:text-white">
                                        {paymentData.accountName}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-[16px]">
                                    <span className="text-[var(--brand-grey-foreground)]">
                                        {locale === 'vi' ? 'Số tiền' : 'Amount'}
                                    </span>
                                    <button
                                        onClick={() => copyToClipboard(String(paymentData.amount), 'amount')}
                                        className="flex items-center gap-1.5 font-bold text-brand-text dark:text-[var(--brand-color)] cursor-pointer hover:text-[var(--brand-color)] transition-colors"
                                    >
                                        {formatPrice(paymentData.amount)}
                                        {copied === 'amount'
                                            ? <Check className="w-3.5 h-3.5 text-[var(--brand-color)]" />
                                            : <Copy className="w-3.5 h-3.5 opacity-40" />}
                                    </button>
                                </div>
                                <div className="flex items-center justify-between text-[16px]">
                                    <span className="text-[var(--brand-grey-foreground)]">
                                        {locale === 'vi' ? 'Nội dung CK' : 'Description'}
                                    </span>
                                    <button
                                        onClick={() => copyToClipboard(paymentData.description, 'desc')}
                                        className="flex items-center gap-1.5 font-semibold text-brand-text dark:text-white cursor-pointer hover:text-[var(--brand-color)] transition-colors"
                                    >
                                        {paymentData.description}
                                        {copied === 'desc'
                                            ? <Check className="w-3.5 h-3.5 text-[var(--brand-color)]" />
                                            : <Copy className="w-3.5 h-3.5 opacity-40" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Status + PayOS link */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500 dark:bg-[var(--brand-color)] animate-pulse" />
                                <p className="text-[14px] text-amber-600 dark:text-[var(--brand-color)]">
                                    {locale === 'vi' ? 'Đang chờ thanh toán...' : 'Waiting for payment...'}
                                </p>
                            </div>
                            <Link
                                href={paymentData.checkoutUrl}
                                target="_blank"
                                className="inline-flex items-center gap-1 text-[13px] text-[var(--brand-grey-foreground)] hover:text-brand-text dark:hover:text-[var(--brand-color)] transition-colors"
                            >
                                <ExternalLink className="w-3 h-3" />
                                PayOS
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ═══ NOT AUTHENTICATED — LOGIN GATEWAY ═══
    const callbackUrl = `/purchase?productId=${productId}&source=${source}&plan=${plan}&duration=${duration}`;

    return (
        <div className="flex flex-col w-full h-full">
            <div className="h-full w-full flex flex-col justify-center pt-8">
                {/* Logo + Brand + Slogan */}
                <TabAuthMode />

                {/* Notification */}
                <p className="text-[16px] text-[var(--brand-grey-foreground)] font-normal leading-relaxed mt-6">
                    {productLoading
                        ? <span className="inline-flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {locale === 'vi' ? 'Đang tải...' : 'Loading...'}
                          </span>
                        : locale === 'vi'
                            ? <>
                                {productName
                                    ? <>Bạn đang mua sản phẩm <strong className="text-black dark:text-[var(--brand-color)]">&ldquo;{productName}&rdquo;</strong>.<br />Cần xác thực tài khoản để tiếp tục thanh toán.</>
                                    : <>Cần xác thực tài khoản để tiếp tục thanh toán.</>}
                              </>
                            : <>
                                {productName
                                    ? <>You are purchasing <strong className="text-black dark:text-[var(--brand-color)]">&ldquo;{productName}&rdquo;</strong>.<br />Account verification is required to proceed.</>
                                    : <>Account verification is required to proceed.</>}
                              </>}
                </p>

                {/* Primary CTA */}
                <Button
                    asChild
                    className="w-full h-12 bg-[var(--brand-color)] cursor-pointer text-black font-bold px-6 rounded-3xl hover:bg-[var(--brand-color-foreground)] transition-colors! duration-300 ease-in-out text-[16px]! border border-black/20 dark:border-[var(--brand-grey-foreground)]/30 mt-8"
                >
                    <Link href={`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
                        {locale === 'vi' ? 'Đăng nhập' : 'Sign In'}
                    </Link>
                </Button>

                {/* Sign up link + Back */}
                <div className="text-center text-[16px] font-medium flex flex-col gap-3 mt-4">
                    <div className="flex gap-2 justify-center items-center">
                        {locale === 'vi' ? 'Chưa có tài khoản?' : "Don't have an account?"}{' '}
                        <Link
                            href={`/auth/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                            className="dark:text-[var(--brand-color)] text-black font-bold hover:font-extrabold dark:hover:text-[var(--brand-color-foreground)] transition-all! duration-300 ease-in-out"
                        >
                            {locale === 'vi' ? 'Đăng Ký' : 'Sign Up'}
                        </Link>
                    </div>
                    <button
                        onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/'}
                        className="text-[var(--brand-grey-foreground)] font-semibold hover:text-brand-text dark:hover:text-[var(--brand-color)] hover:underline transition-all cursor-pointer"
                    >
                        ← {locale === 'vi' ? 'Quay lại' : 'Go back'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function PurchaseGatewayWrapper() {
    return (
        <Suspense
            fallback={
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-color)]" />
                </div>
            }
        >
            <PurchaseGateway />
        </Suspense>
    );
}
