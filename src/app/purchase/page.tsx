'use client';

import { useEffect, useState, Suspense, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Copy, Check, CircleX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/context/i18n/context';
import Link from 'next/link';

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

const formatTransactionCode = (code: number | string): string => {
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

    // Ref to prevent duplicate transaction creation (StrictMode / refresh)
    const transactionCreatedRef = useRef(false);

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
        if (status === 'authenticated' && productId && !isCreating && !paymentData && !transactionCreatedRef.current && !error) {
            transactionCreatedRef.current = true;
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
                        setError(data.error?.message || 'Failed to create transaction');
                        transactionCreatedRef.current = false; // allow retry
                    }
                })
                .catch(() => {
                    setError('Network error');
                    transactionCreatedRef.current = false; // allow retry
                })
                .finally(() => setIsCreating(false));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, productId]);

    // Poll payment status every 3s
    useEffect(() => {
        if (!paymentData || paymentStatus !== 'PENDING') return;

        const interval = setInterval(() => {
            fetch(`/api/payos/verify?transactionCode=${paymentData.orderCode}`)
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'PAID') {
                        setPaymentStatus('PAID');
                        router.push(`/checkout/confirmation?transactionCode=${paymentData.orderCode}&status=success`);
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
    // Skip if paymentData exists — after order creation, router.replace('/purchase')
    // cleans URL params but paymentData remains in React state.
    if (!productId && !paymentData && !isCreating && !error) {
        return (
            <div className="flex flex-col w-full h-full">
                <div className="h-full w-full flex flex-col justify-center items-center pt-8 text-center">
                    {/* Message */}
                    <p className="text-[18px] text-black/90 dark:text-white/90 font-medium leading-relaxed text-center">
                        {locale === 'vi'
                            ? 'Không tìm thấy sản phẩm. Vui lòng quay lại và chọn sản phẩm để mua.'
                            : 'Product not found. Please go back and select a product to purchase.'}
                    </p>

                    {/* Back link */}
                    <div className="text-center text-[16px] font-medium flex flex-col gap-3 mt-8">
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

    // ═══ CREATING ORDER STATE ═══
    if (status === 'authenticated' && (isCreating || (!paymentData && !error))) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--brand-color)] mb-6" />
                <p className="text-brand-text dark:text-white font-semibold text-[16px] mb-1">
                    {locale === 'vi' ? 'Đang Xử Lý...' : 'Processing...'}
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
            <div className="flex flex-col w-full h-full">
                <div className="h-full w-full flex flex-col justify-center items-center pt-8 text-center">
                    {/* Icon — synced with confirmation page */}
                    <div className="mb-6">
                        <CircleX className="w-16 h-16 mx-auto text-red-500/80" strokeWidth={1.5} />
                    </div>
                    <p className="text-brand-text dark:text-[var(--brand-color)] font-bold text-xl mb-2">
                        {locale === 'vi' ? 'Không Thể Tạo Giao Dịch' : 'Failed To Create Transaction'}
                    </p>
                    <p className="text-black/90 dark:text-white/90 text-[18px] font-medium mb-6 leading-relaxed">{error}</p>
                    <Button
                        onClick={() => window.location.reload()}
                        className="h-10 px-6 text-[16px]! font-semibold rounded-lg bg-[var(--brand-color)] text-black border border-[var(--brand-color)] dark:border-black hover:bg-[var(--brand-color)]/90 transition-all duration-300"
                    >
                        {locale === 'vi' ? 'Thử lại' : 'Try Again'}
                    </Button>
                    <button
                        onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/'}
                        className="text-[var(--brand-grey-foreground)] font-semibold hover:text-brand-text dark:hover:text-[var(--brand-color)] hover:underline transition-all cursor-pointer text-[16px] mt-4"
                    >
                        ← {locale === 'vi' ? 'Quay lại' : 'Go back'}
                    </button>
                </div>
            </div>
        );
    }

    // ═══ EMBEDDED CHECKOUT (AUTHENTICATED + PAYMENT DATA) ═══
    // MUST check BEFORE !productId — after order creation, router.replace('/purchase')
    // cleans URL params, but paymentData remains in React state.
    if (paymentData) {
        const pName = paymentData.product.name[locale] || paymentData.product.name.vi || paymentData.product.name.en || 'Product';

        return (
            <div className="flex flex-col w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl lg:text-3xl font-bold text-brand-text dark:text-[var(--brand-color)]">
                        {locale === 'vi' ? 'Thanh Toán' : 'Payment'}
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
                    <div className="w-full md:w-[38%] rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] p-6 flex flex-col items-center justify-center">
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
                    <div className="w-full md:w-[62%] flex flex-col gap-4">

                        {/* Transaction Code row */}
                        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] overflow-hidden">
                            <div className="px-5 py-3 border-b border-black/5 dark:border-white/5">
                                <p className="text-[13px] uppercase tracking-wider text-[var(--brand-grey-foreground)] font-medium">
                                    {locale === 'vi' ? 'Giao dịch' : 'Transaction'}
                                </p>
                            </div>
                            <div className="p-5 space-y-3">
                                {/* Product */}
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0 mr-3">
                                        <p className="font-semibold text-black dark:text-[var(--brand-color)] text-[17px] truncate">
                                            {pName}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5 text-[14px] text-[var(--brand-grey-foreground)]">
                                            {paymentData.product.plan !== 'free' && (
                                                <>
                                                    <span className="font-semibold">
                                                        {paymentData.product.plan.charAt(0).toUpperCase() + paymentData.product.plan.slice(1)}
                                                    </span>
                                                    <span>·</span>
                                                </>
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

                                {/* Transaction Code */}
                                <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
                                    <span className="text-[16px] text-[var(--brand-grey-foreground)]">
                                        {locale === 'vi' ? 'Mã giao dịch' : 'Transaction code'}
                                    </span>
                                    <button
                                        onClick={() => copyToClipboard(String(paymentData.orderCode), 'code')}
                                        className="flex items-center gap-1.5 text-[16px] font-semibold text-brand-text dark:text-white cursor-pointer hover:text-[var(--brand-color)] transition-colors"
                                    >
                                        {formatTransactionCode(paymentData.orderCode)}
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

                        {/* Status */}
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-black dark:bg-[var(--brand-color)] animate-pulse" />
                            <p className="text-[16px] text-black dark:text-[var(--brand-color)]">
                                {locale === 'vi' ? 'Đang chờ thanh toán...' : 'Waiting for payment...'}
                            </p>
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

                {/* Notification */}
                <p className="text-[18px] text-black/90 dark:text-white/90 font-medium leading-relaxed mt-6 mx-auto w-fit">
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
                    className="w-fit mx-auto h-12 bg-[var(--brand-color)] cursor-pointer text-black font-bold px-12 rounded-3xl hover:bg-[var(--brand-color-foreground)] transition-colors! duration-300 ease-in-out text-[16px]! border border-black/20 dark:border-[var(--brand-grey-foreground)]/30 mt-8"
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
