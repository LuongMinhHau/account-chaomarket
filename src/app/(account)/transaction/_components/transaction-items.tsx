import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    type Transaction,
    type StatusKey,
    STATUS_COLORS,
    STATUS_ICONS,
    formatCurrency,
    formatTransactionCode,
} from './transaction-types';
import { Clock } from 'lucide-react';

// ── Transaction Row (Desktop) ──
export function TransactionRow({
    tx,
    getStatusLabel,
    timeAgo,
    onToggleStar,
}: {
    tx: Transaction;
    getStatusLabel: (s: StatusKey) => string;
    timeAgo: (dateStr: string) => string;
    onToggleStar: (e: React.MouseEvent) => void;
}) {
    const sk = (tx.status as StatusKey) || 'PENDING';
    const colors = STATUS_COLORS[sk] || STATUS_COLORS.PENDING;

    return (
        <div
            className={cn(
                'group flex items-center gap-3 px-3 py-2.5',
                'border-b border-border/30 dark:border-white/[0.06]',
                'transition-colors duration-100',
                'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
            )}
        >
            <button
                onClick={onToggleStar}
                className={cn(
                    'flex-shrink-0 p-0.5 rounded transition-colors duration-150 cursor-pointer',
                    tx.isStarred
                        ? 'text-amber-400 hover:text-amber-500'
                        : 'text-black/20 dark:text-white/20 hover:text-amber-400',
                )}
                aria-label={tx.isStarred ? 'Unstar' : 'Star'}
            >
                <Star
                    className="size-[16px]"
                    fill={tx.isStarred ? 'currentColor' : 'none'}
                    strokeWidth={2}
                />
            </button>

            <div
                className="grid flex-1 min-w-0 items-center"
                style={{ gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, 0.5fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '0 16px' }}
            >
                <span className="text-[14px] min-w-0 truncate font-semibold text-black/90 dark:text-white/90">
                    {tx.gatewayTransactionId ? formatTransactionCode(tx.gatewayTransactionId) : '—'}
                </span>
                <span className="text-[14px] min-w-0 truncate font-normal text-black/60 dark:text-white/60">
                    {tx.paymentGateway || '—'}
                </span>
                <span className="text-[14px] font-bold text-black/90 dark:text-white/90 tabular-nums text-right">
                    {formatCurrency(tx.amount)}
                </span>
                <span className="text-[13px] font-medium text-black/40 dark:text-white/40">
                    {tx.currency || 'VND'}
                </span>
                <span className={cn(
                    'inline-flex items-center gap-1.5 text-[14px] font-medium whitespace-nowrap',
                    colors.text
                )}>
                    <span className={cn('size-1.5 rounded-full flex-shrink-0', colors.dot)} />
                    {getStatusLabel(sk)}
                </span>
                <span className="text-[14px] whitespace-nowrap font-normal text-black/50 dark:text-white/50">
                    {timeAgo(tx.createdAt)}
                </span>
            </div>
        </div>
    );
}

// ── Transaction Card (Mobile) ──
export function TransactionCard({
    tx,
    getStatusLabel,
    timeAgo,
    onToggleStar,
}: {
    tx: Transaction;
    getStatusLabel: (s: StatusKey) => string;
    timeAgo: (dateStr: string) => string;
    onToggleStar: (e: React.MouseEvent) => void;
}) {
    const sk = (tx.status as StatusKey) || 'PENDING';
    const colors = STATUS_COLORS[sk] || STATUS_COLORS.PENDING;
    const StatusIcon = STATUS_ICONS[sk] || Clock;

    return (
        <div
            className={cn(
                'px-3 py-3',
                'border-b border-border/30 dark:border-white/[0.06]',
                'transition-colors duration-100',
                'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
            )}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onToggleStar}
                        className={cn(
                            'flex-shrink-0 p-0.5 rounded transition-colors duration-150 cursor-pointer',
                            tx.isStarred
                                ? 'text-amber-400 hover:text-amber-500'
                                : 'text-black/20 dark:text-white/20 hover:text-amber-400',
                        )}
                        aria-label={tx.isStarred ? 'Unstar' : 'Star'}
                    >
                        <Star
                            className="size-[14px]"
                            fill={tx.isStarred ? 'currentColor' : 'none'}
                            strokeWidth={2}
                        />
                    </button>
                    <div>
                        <span className="text-[14px] font-semibold text-black/90 dark:text-white/90 tabular-nums">
                            {tx.gatewayTransactionId ? formatTransactionCode(tx.gatewayTransactionId) : '—'}
                        </span>
                        <p className="text-[13px] text-black/40 dark:text-white/40 mt-0.5">
                            {tx.paymentGateway || '—'}
                        </p>
                    </div>
                </div>
                <span className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium',
                    colors.text, colors.bg
                )}>
                    <StatusIcon className="size-3" />
                    {getStatusLabel(sk)}
                </span>
            </div>
            <div className="flex items-end justify-between">
                <span className="text-[16px] font-bold text-black/90 dark:text-white/90 tabular-nums">
                    {formatCurrency(tx.amount)} <span className="text-[13px] font-medium text-black/50 dark:text-white/50">{tx.currency || 'VND'}</span>
                </span>
                <span className="text-[12px] text-black/40 dark:text-white/40">
                    {timeAgo(tx.createdAt)}
                </span>
            </div>
        </div>
    );
}
