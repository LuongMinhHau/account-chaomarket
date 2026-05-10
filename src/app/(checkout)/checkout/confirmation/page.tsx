'use client';

import { Button } from '@/components/ui/button';
import { redirect, useSearchParams } from 'next/navigation';
import { useI18n } from '@/context/i18n/context';
import { CircleX, ArrowRight, Copy, Check, CircleCheck, Download, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { formatTransactionCode } from '@/lib/format-transaction-code';

interface EntitlementData {
    id: string;
    durationMonths: number;
    expiresAt: string;
    status: string;
    product: {
        id: string;
        name: { en?: string; vi?: string } | string;
        downloadLink?: string | null;
        downloadLabel?: { en?: string; vi?: string } | string | null;
        type?: string | null;
    };
}

export default function CheckoutConfirmation() {
    const searchParams = useSearchParams();
    const { locale } = useI18n();
    const transactionCode = searchParams.get('transactionCode');
    const urlStatus = searchParams.get('status');
    const [copied, setCopied] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [entitlements, setEntitlements] = useState<EntitlementData[]>([]);
    const [loadingEntitlements, setLoadingEntitlements] = useState(false);

    // Verified payment status from PayOS
    const [verifiedStatus, setVerifiedStatus] = useState<'LOADING' | 'PAID' | 'CANCELLED' | 'FAILED' | 'PENDING'>(
        urlStatus === 'CANCELLED' ? 'CANCELLED' : 'LOADING'
    );

    useEffect(() => {
        setMounted(true);
    }, []);

    // Verify actual payment status from PayOS
    useEffect(() => {
        if (urlStatus === 'CANCELLED' || !transactionCode) return;

        fetch(`/api/payos/verify?transactionCode=${transactionCode}`)
            .then(res => res.json())
            .then(data => {
                const s = data.status;
                if (s === 'PAID') setVerifiedStatus('PAID');
                else if (s === 'CANCELLED') setVerifiedStatus('CANCELLED');
                else if (s === 'PENDING' || s === 'PROCESSING') setVerifiedStatus('PENDING');
                else setVerifiedStatus('FAILED');
            })
            .catch(() => setVerifiedStatus('FAILED'));
    }, [transactionCode, urlStatus]);

    // Proactively cancel in DB when redirected with CANCELLED status
    useEffect(() => {
        if (urlStatus !== 'CANCELLED' || !transactionCode) return;

        fetch('/api/payos/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transactionCode }),
        }).catch(() => { /* silent — best effort */ });
    }, [transactionCode, urlStatus]);

    // Fetch entitlements only when payment is verified as PAID
    useEffect(() => {
        if (transactionCode && verifiedStatus === 'PAID') {
            setLoadingEntitlements(true);
            fetch(`/api/entitlements/by-order?transactionCode=${transactionCode}`)
                .then(res => res.json())
                .then(data => setEntitlements(data.data || []))
                .catch(() => { })
                .finally(() => setLoadingEntitlements(false));
        }
    }, [transactionCode, verifiedStatus]);

    const copyTransactionCode = () => {
        if (transactionCode) {
            navigator.clipboard.writeText(formatTransactionCode(transactionCode));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const localized = (field: unknown): string => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        if (typeof field === 'object' && field !== null)
            return (
                (field as Record<string, string>)[locale] ||
                (field as Record<string, string>)['en'] ||
                ''
            );
        return '';
    };

    const hasEntitlements = entitlements.length > 0;


    // ─── LOADING STATE (verifying payment) ───
    if (verifiedStatus === 'LOADING') {
        return (
            <div className="w-full min-h-[60vh] flex items-center justify-center px-4">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-[var(--brand-color)] mx-auto mb-4" />
                    <p className="text-[var(--brand-grey-foreground)] text-[16px]">
                        {locale === 'vi' ? 'Đang xác minh thanh toán...' : 'Verifying payment...'}
                    </p>
                </div>
            </div>
        );
    }

    // ─── CANCELLED / FAILED STATE ───
    if (verifiedStatus === 'CANCELLED' || verifiedStatus === 'FAILED' || verifiedStatus === 'PENDING') {
        const isCancelled = verifiedStatus === 'CANCELLED';
        const isPending = verifiedStatus === 'PENDING';
        return (
            <div className="w-full min-h-[60vh] flex items-center justify-center px-4">
                <div
                    className={`max-w-lg w-full text-center transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                >
                    {/* Icon */}
                    <div className="mb-6">
                        <CircleX className="w-16 h-16 mx-auto text-red-500/80" strokeWidth={1.5} />
                    </div>

                    <h1 className="text-2xl lg:text-3xl font-bold text-brand-text dark:text-[var(--brand-color)] mb-2">
                        {locale === 'vi'
                            ? (isCancelled ? 'Thanh Toán Đã Bị Hủy' : isPending ? 'Đang Chờ Thanh Toán' : 'Thanh Toán Thất Bại')
                            : (isCancelled ? 'Payment Cancelled' : isPending ? 'Payment Pending' : 'Payment Failed')}
                    </h1>
                    <p className="text-black/90 dark:text-white/90 text-[18px] font-medium mb-6 leading-relaxed">
                        {locale === 'vi'
                            ? 'Giao dịch chưa được xử lý. Bạn có thể thử lại hoặc liên hệ hỗ trợ.'
                            : 'Your transaction was not processed. You can try again or contact support.'}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-col items-center gap-4">
                        <Button
                            className="h-10 px-5 text-[16px]! font-semibold rounded-lg bg-[var(--brand-color)] text-black border border-[var(--brand-color)] dark:border-black hover:bg-[var(--brand-color)]/90 hover:scale-[1.02] transition-all duration-300"
                            onClick={() => redirect('/transaction')}
                        >
                            {locale === 'vi' ? 'Xem Lịch Sử Giao Dịch' : 'View Transaction History'}
                        </Button>
                        <button
                            onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/'}
                            className="text-[var(--brand-grey-foreground)] font-semibold hover:text-brand-text dark:hover:text-[var(--brand-color)] hover:underline transition-all cursor-pointer text-[16px]"
                        >
                            ← {locale === 'vi' ? 'Quay lại' : 'Go back'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── SUCCESS STATE (verifiedStatus === 'PAID') ───
    return (
        <div className="w-full min-h-[60vh] flex items-center justify-center px-4">
            <div
                className={`max-w-lg w-full text-center transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            >
                {/* Success icon */}
                <div className="mb-6">
                    <CircleCheck className="w-16 h-16 mx-auto text-[var(--brand-color)]" strokeWidth={1.5} />
                </div>

                <h1 className="text-2xl lg:text-3xl font-bold text-brand-text dark:text-[var(--brand-color)] mb-2">
                    {locale === 'vi' ? 'Thanh Toán Thành Công!' : 'Payment Successful!'}
                </h1>
                <p className="text-black/90 dark:text-white/90 text-[18px] font-medium mb-6 leading-relaxed">
                    {locale === 'vi'
                        ? 'Cảm ơn bạn đã đặt hàng. Nhấn vào liên kết bên dưới để nhận sản phẩm.'
                        : 'Thank you for your purchase. Click the link below to receive your products.'}
                </p>

                {/* Transaction details card */}
                {transactionCode && (
                    <div className="mb-6 mx-auto max-w-sm rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] overflow-hidden">
                        {/* Transaction Code row */}
                        <div className="flex items-center justify-between p-5 border-b border-black/5 dark:border-white/5">
                            <div className="text-left">
                                <p className="text-[12px] uppercase tracking-wider text-[var(--brand-grey-foreground)] font-medium mb-1">
                                    {locale === 'vi' ? 'Mã giao dịch' : 'Transaction Code'}
                                </p>
                                <p className="text-xl font-bold text-brand-text dark:text-white tabular-nums tracking-wide">
                                    {formatTransactionCode(transactionCode)}
                                </p>
                            </div>
                            <button
                                onClick={copyTransactionCode}
                                className="p-2.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 cursor-pointer"
                                title={locale === 'vi' ? 'Sao chép mã' : 'Copy code'}
                            >
                                {copied ? (
                                    <Check className="w-4 h-4 text-[var(--brand-color)]" />
                                ) : (
                                    <Copy className="w-4 h-4 text-[var(--brand-grey-foreground)]" />
                                )}
                            </button>
                        </div>

                        {/* Product list */}
                        <div className="px-5 py-4">
                            <p className="text-[12px] uppercase tracking-wider text-[var(--brand-grey-foreground)] font-medium mb-3">
                                {locale === 'vi' ? 'Sản phẩm' : 'Products'}
                            </p>
                            {loadingEntitlements ? (
                                <div className="flex items-center justify-center py-2">
                                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                                </div>
                            ) : hasEntitlements ? (
                                <div className="space-y-2.5">
                                    {entitlements.map((ent) => (
                                        <div key={ent.id} className="flex items-center justify-between text-[14px]">
                                            <span className="font-medium text-brand-text dark:text-white truncate mr-3">
                                                {localized(ent.product?.name) || (locale === 'vi' ? 'Sản phẩm' : 'Product')}
                                            </span>
                                            <span className="text-[var(--brand-grey-foreground)] whitespace-nowrap text-[13px]">
                                                {ent.durationMonths} {locale === 'vi' ? 'tháng' : ent.durationMonths === 1 ? 'month' : 'months'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-[13px] text-[var(--brand-grey-foreground)]">
                                    {locale === 'vi' ? 'Đang xử lý giao dịch...' : 'Processing transaction...'}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Product access & downloads section */}
                {loadingEntitlements ? (
                    <div className="mb-6 flex items-center justify-center py-4">
                        <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    </div>
                ) : hasEntitlements && (
                    <div className="mb-6 mx-auto max-w-sm rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] overflow-hidden">
                        <div className="px-5 pt-4 pb-2 border-b border-black/5 dark:border-white/5">
                            <div className="flex items-center gap-2 text-[13px] font-semibold text-brand-text dark:text-white uppercase tracking-wider">
                                <Download className="size-3.5" />
                                {locale === 'vi' ? 'Quyền truy cập & Tải xuống' : 'Product Access & Downloads'}
                            </div>
                        </div>
                        {entitlements.map((ent) => (
                            <div key={ent.id} className="px-5 py-3 border-b border-black/5 dark:border-white/5 last:border-b-0">
                                <p className="text-[13px] font-semibold text-brand-text dark:text-white text-left mb-2 truncate">
                                    {localized(ent.product.name)}
                                </p>
                                {/* Duration & expiry */}
                                <div className="flex items-center justify-between text-[12px] text-[var(--brand-grey-foreground)]">
                                    <span>{ent.durationMonths} {locale === 'vi' ? 'tháng' : (ent.durationMonths === 1 ? 'month' : 'months')}</span>
                                    <span>
                                        {locale === 'vi' ? 'Hết hạn: ' : 'Expires: '}
                                        {new Date(ent.expiresAt).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                    </span>
                                </div>
                                {/* Download link */}
                                {ent.product.downloadLink && (
                                    <a
                                        href={ent.product.downloadLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-3 text-[13px] font-semibold text-black bg-[var(--brand-color)] rounded-lg hover:bg-[var(--brand-color)]/90 transition-all"
                                    >
                                        <Download className="size-3.5" />
                                        {localized(ent.product.downloadLabel) || (locale === 'vi' ? 'Tải xuống' : 'Download')}
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Progress steps */}
                <div className="mb-8 mx-auto max-w-xs">
                    <div className="flex items-center justify-center gap-2 text-[13px]">
                        <div className="flex items-center gap-1.5 text-black dark:text-[var(--brand-color)]">
                            <div className="w-5 h-5 rounded-full bg-[var(--brand-color)] text-black text-[10px] font-bold flex items-center justify-center">✓</div>
                            <span className="font-medium">{locale === 'vi' ? 'Mua' : 'Purchased'}</span>
                        </div>
                        <div className="w-6 h-px bg-black dark:bg-[var(--brand-color)]" />
                        <div className="flex items-center gap-1.5 text-black dark:text-[var(--brand-color)]">
                            <div className="w-5 h-5 rounded-full bg-[var(--brand-color)] text-black text-[10px] font-bold flex items-center justify-center">✓</div>
                            <span className="font-medium">{locale === 'vi' ? 'Thanh toán' : 'Paid'}</span>
                        </div>
                        <div className={cn("w-6 h-px", hasEntitlements ? "bg-black dark:bg-[var(--brand-color)]" : "bg-black/15 dark:bg-white/15")} />
                        <div className={cn("flex items-center gap-1.5", hasEntitlements ? "text-black dark:text-[var(--brand-color)]" : "text-[var(--brand-grey-foreground)]")}>
                            {hasEntitlements ? (
                                <div className="w-5 h-5 rounded-full bg-[var(--brand-color)] text-black text-[10px] font-bold flex items-center justify-center">✓</div>
                            ) : (
                                <div className="w-5 h-5 rounded-full border border-black/15 dark:border-white/15 text-[10px] font-bold flex items-center justify-center">3</div>
                            )}
                            <span className="font-medium">{locale === 'vi' ? 'Giao hàng' : 'Delivery'}</span>
                        </div>
                    </div>
                </div>

                {/* Inspirational quote */}
                <p className="text-[14px] italic text-[var(--brand-grey-foreground)] mb-8">
                    {locale === 'vi'
                        ? '"Chúc bạn thành công trên hành trình đầu tư."'
                        : '"Wishing you all the best on your investment journey."'}
                </p>

                {/* Actions */}
                <div className="flex flex-col items-center gap-4">
                    <Button
                        className="h-10 px-5 text-[16px]! font-semibold rounded-lg bg-[var(--brand-color)] text-black border border-[var(--brand-color)] dark:border-black hover:bg-[var(--brand-color)]/90 hover:scale-[1.02] transition-all duration-300"
                        onClick={() => redirect('/transaction')}
                    >
                        {locale === 'vi' ? 'Quản Lý Giao Dịch' : 'Manage Transactions'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <button
                        onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/'}
                        className="text-[var(--brand-grey-foreground)] font-semibold hover:text-brand-text dark:hover:text-[var(--brand-color)] hover:underline transition-all cursor-pointer text-[16px]"
                    >
                        ← {locale === 'vi' ? 'Quay lại' : 'Go back'}
                    </button>
                </div>
            </div>
        </div>
    );
}
