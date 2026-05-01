'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import {
    Package,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowUpDown,
    ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import LoadingSpinner from '@/components/loading-spinner';
import PageHeader from '@/components/page-header';
import EmptyState from '@/components/empty-state';
import { useRouter } from 'next/navigation';

interface Transaction {
    id: string;
    status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'CANCELLED';
    amount: string | number;
    createdAt: string;
    orderId?: string;
    consultationId?: string;
    paymentGateway?: string;
    gatewayTransactionId?: string;
}

const statusConfig = {
    COMPLETED: {
        icon: CheckCircle2,
        label: 'Hoàn thành',
        color: 'text-green-600 dark:text-green-400',
        dotColor: 'bg-green-500',
    },
    PENDING: {
        icon: Clock,
        label: 'Đang chờ',
        color: 'text-amber-600 dark:text-amber-400',
        dotColor: 'bg-amber-500',
    },
    FAILED: {
        icon: AlertCircle,
        label: 'Thất bại',
        color: 'text-red-600 dark:text-red-400',
        dotColor: 'bg-red-500',
    },
    CANCELLED: {
        icon: AlertCircle,
        label: 'Đã huỷ',
        color: 'text-red-600 dark:text-red-400',
        dotColor: 'bg-red-500',
    },
} as const;

function formatCurrency(amount: string | number): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: 0 }).format(num) + ' VND';
}

function formatOrderCode(raw: string): string {
    return raw.length > 12 ? `#${raw.slice(-8).toUpperCase()}` : `#${raw}`;
}

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
}

export default function OrdersPage() {
    const { status } = useSession();
    const router = useRouter();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?callbackUrl=/account/orders');
            return;
        }
        if (status === 'authenticated') {
            fetch('/api/account/orders')
                .then(r => r.json())
                .then(d => setTransactions(d.data || []))
                .catch(() => {})
                .finally(() => setLoading(false));
        }
    }, [status]);

    const sorted = useMemo(() => {
        return [...transactions].sort((a, b) => {
            const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            return sortOrder === 'newest' ? diff : -diff;
        });
    }, [transactions, sortOrder]);

    if (loading || status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="w-full h-full mx-auto space-y-6">
            <PageHeader
                title="Lịch Sử Đơn Hàng"
                description="Xem tất cả giao dịch của bạn với Chào Market"
            />

            <Card className="page-card">
                <CardContent className="p-0">
                    {transactions.length === 0 ? (
                        <EmptyState
                            icon={<Package className="size-8" />}
                            title="Chưa có đơn hàng nào"
                            description="Đơn hàng từ Chào Market sẽ hiển thị ở đây."
                        />
                    ) : (
                        <div>
                            {/* Toolbar */}
                            <div className="flex items-center justify-between px-5 py-3">
                                <span className="text-sm font-medium text-foreground">
                                    Tổng: {sorted.length} đơn hàng
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setSortOrder(s => s === 'newest' ? 'oldest' : 'newest')}
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-foreground/70 transition-colors cursor-pointer"
                                >
                                    <ArrowUpDown className="size-3.5" />
                                    {sortOrder === 'newest' ? 'Cũ nhất' : 'Mới nhất'}
                                </button>
                            </div>

                            <div className="rounded-lg border border-border/40 dark:border-white/[0.08] overflow-hidden mx-5 mb-5">
                                {/* Table header */}
                                <div
                                    className="grid items-center px-3 py-2.5 gap-x-3 text-[13px] font-medium text-foreground/50 border-b border-border/40 dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02]"
                                    style={{ gridTemplateColumns: '100px 1fr 110px 90px 160px' }}
                                >
                                    <span className="text-left">Mã Đơn</span>
                                    <span className="text-left">Thanh Toán</span>
                                    <span className="text-right">Số Tiền</span>
                                    <span className="text-center">Trạng Thái</span>
                                    <span className="text-right">Thời Gian</span>
                                </div>

                                {sorted.map(tx => {
                                    const statusKey = (tx.status as keyof typeof statusConfig) || 'PENDING';
                                    const st = statusConfig[statusKey] || statusConfig.PENDING;

                                    return (
                                        <div
                                            key={tx.id}
                                            className="border-b last:border-b-0 border-border/30 dark:border-white/[0.06]"
                                        >
                                            <div
                                                className={cn(
                                                    'grid items-center px-3 py-3 gap-x-3 text-[14px]',
                                                    'hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors',
                                                )}
                                                style={{ gridTemplateColumns: '100px 1fr 110px 90px 160px' }}
                                            >
                                                <span className="font-medium tabular-nums truncate">
                                                    {tx.gatewayTransactionId ? formatOrderCode(tx.gatewayTransactionId) : '—'}
                                                </span>
                                                <span className="truncate text-muted-foreground">
                                                    {tx.paymentGateway || '—'}
                                                </span>
                                                <span className="font-semibold text-right tabular-nums">
                                                    {formatCurrency(tx.amount)}
                                                </span>
                                                <span className={cn('text-center text-[13px]', st.color)}>
                                                    {st.label}
                                                </span>
                                                <span className="text-right text-[13px] text-muted-foreground">
                                                    {timeAgo(tx.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
