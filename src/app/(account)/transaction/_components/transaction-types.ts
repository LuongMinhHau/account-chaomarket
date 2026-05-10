import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';

// ── Types ──
export interface Transaction {
    id: string;
    status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'CANCELLED';
    amount: string | number;
    currency?: string;
    createdAt: string;
    orderId?: string;
    consultationId?: string;
    paymentGateway?: string;
    gatewayTransactionId?: string;
    isStarred?: boolean;
}

export type StatusKey = keyof typeof STATUS_ICONS;
export type FilterStatus = 'all' | 'starred' | 'completed' | 'pending' | 'failed' | 'cancelled';
export type SortKey = 'transactionCode' | 'payment' | 'amount' | 'currency' | 'status' | 'time';
export type SortDir = 'asc' | 'desc';

// ── Constants ──
export const STATUS_ICONS = {
    COMPLETED: CheckCircle2,
    PENDING: Clock,
    FAILED: AlertCircle,
    CANCELLED: XCircle,
} as const;

export const STATUS_COLORS = {
    COMPLETED: {
        text: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-500/10',
        dot: 'bg-green-500',
    },
    PENDING: {
        text: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-500/10',
        dot: 'bg-amber-500',
    },
    FAILED: {
        text: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-500/10',
        dot: 'bg-red-500',
    },
    CANCELLED: {
        text: 'text-zinc-500 dark:text-zinc-400',
        bg: 'bg-zinc-500/10',
        dot: 'bg-zinc-500',
    },
} as const;

export const ITEMS_PER_PAGE = 15;

// ── Helpers ──
export function formatCurrency(amount: string | number): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('vi-VN', { style: 'decimal', maximumFractionDigits: 0 }).format(num);
}

export function formatTransactionCode(raw: string): string {
    return raw.length > 12 ? `#${raw.slice(-8).toUpperCase()}` : `#${raw}`;
}

export function useTimeAgo() {
    return (dateStr: string): string => {
        const d = new Date(dateStr);
        const dd = String(d.getDate()).padStart(2, '0');
        const MM = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        const HH = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        return `${HH}:${mm} ${dd}/${MM}/${yyyy}`;
    };
}
