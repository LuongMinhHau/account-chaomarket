'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Package,
    Filter,
    ChevronDown,
    Search,
    Star,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Calendar,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import LoadingSpinner from '@/components/loading-spinner';
import PageHeader from '@/components/page-header';
import EmptyState from '@/components/empty-state';
import { BirthDatePicker } from '@/components/birth-date-picker';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/context/i18n/context';
import { usePageTitle } from '@/hooks/use-page-title';
import { toast } from 'sonner';

import {
    type Transaction,
    type StatusKey,
    type FilterStatus,
    type SortKey,
    type SortDir,
    STATUS_ICONS,
    ITEMS_PER_PAGE,
    formatCurrency,
    useTimeAgo,
} from './_components/transaction-types';
import { TransactionRow, TransactionCard } from './_components/transaction-items';

export default function TransactionsPage() {
    const { status } = useSession();
    const router = useRouter();
    const { t } = useI18n();
    usePageTitle('orders.title');
    const timeAgo = useTimeAgo();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterStatus>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCount, setShowCount] = useState(ITEMS_PER_PAGE);
    const [sortKey, setSortKey] = useState<SortKey>('time');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
    const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?callbackUrl=/transaction');
            return;
        }
        if (status === 'authenticated') {
            fetch('/api/account/orders')
                .then(r => r.json())
                .then(d => {
                    setTransactions(d.data || []);
                })
                .catch(() => {
                    toast.error(t('orders.fetchError'));
                    setTransactions([]);
                })
                .finally(() => setLoading(false));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    // Reset showCount on filter/search change
    useEffect(() => {
        setShowCount(ITEMS_PER_PAGE);
    }, [filter, searchQuery, dateFrom, dateTo]);

    // ── Status label i18n ──
    const getStatusLabel = (s: StatusKey) => {
        const map: Record<StatusKey, string> = {
            COMPLETED: t('orders.status.completed'),
            PENDING: t('orders.status.pending'),
            FAILED: t('orders.status.failed'),
            CANCELLED: t('orders.status.cancelled'),
        };
        return map[s];
    };

    // ── Star toggle ──
    const handleToggleStar = useCallback((tx: Transaction, e: React.MouseEvent) => {
        e.stopPropagation();
        const newStarred = !tx.isStarred;

        // Optimistic update
        setTransactions(prev =>
            prev.map(item =>
                item.id === tx.id ? { ...item, isStarred: newStarred } : item
            )
        );

        // API call (fire-and-forget)
        fetch('/api/account/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                toggleStar: true,
                transactionId: tx.id,
                isStarred: newStarred,
            }),
        }).catch(() => {});
    }, []);

    // ── Filter + Search + Sort ──
    const filtered = useMemo(() => {
        let result = [...transactions];

        // Filter by status or starred
        if (filter === 'starred') {
            result = result.filter(tx => tx.isStarred);
        } else if (filter !== 'all') {
            const statusMap: Record<string, StatusKey> = {
                completed: 'COMPLETED',
                pending: 'PENDING',
                failed: 'FAILED',
                cancelled: 'CANCELLED',
            };
            result = result.filter(tx => tx.status === statusMap[filter]);
        }

        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(tx =>
                (tx.gatewayTransactionId?.toLowerCase().includes(q)) ||
                (tx.paymentGateway?.toLowerCase().includes(q)) ||
                formatCurrency(tx.amount).includes(q)
            );
        }

        // Date range filter
        if (dateFrom) {
            const from = new Date(dateFrom);
            from.setHours(0, 0, 0, 0);
            result = result.filter(tx => new Date(tx.createdAt) >= from);
        }
        if (dateTo) {
            const to = new Date(dateTo);
            to.setHours(23, 59, 59, 999);
            result = result.filter(tx => new Date(tx.createdAt) <= to);
        }

        // Sort
        const dir = sortDir === 'asc' ? 1 : -1;
        result.sort((a, b) => {
            switch (sortKey) {
                case 'transactionCode':
                    return dir * (a.gatewayTransactionId || '').localeCompare(b.gatewayTransactionId || '');
                case 'payment':
                    return dir * (a.paymentGateway || '').localeCompare(b.paymentGateway || '');
                case 'amount': {
                    const aNum = typeof a.amount === 'string' ? parseFloat(a.amount) : a.amount;
                    const bNum = typeof b.amount === 'string' ? parseFloat(b.amount) : b.amount;
                    return dir * (aNum - bNum);
                }
                case 'status':
                    return dir * a.status.localeCompare(b.status);
                case 'currency':
                    return dir * (a.currency || 'VND').localeCompare(b.currency || 'VND');
                case 'time':
                default:
                    return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            }
        });

        return result;
    }, [transactions, filter, searchQuery, sortKey, sortDir, dateFrom, dateTo]);

    const paginated = filtered.slice(0, showCount);

    // ── Filter options ──
    const filterOptions: { key: FilterStatus; label: string; icon: React.ReactNode }[] = [
        { key: 'all', label: t('orders.filter.all'), icon: <Filter className="size-3.5 text-current" /> },
        { key: 'starred', label: t('orders.filter.starred'), icon: <Star className="size-3.5 text-current" /> },
        { key: 'completed', label: t('orders.status.completed'), icon: <STATUS_ICONS.COMPLETED className="size-3.5 text-current" /> },
        { key: 'pending', label: t('orders.status.pending'), icon: <STATUS_ICONS.PENDING className="size-3.5 text-current" /> },
        { key: 'failed', label: t('orders.status.failed'), icon: <STATUS_ICONS.FAILED className="size-3.5 text-current" /> },
        { key: 'cancelled', label: t('orders.status.cancelled'), icon: <STATUS_ICONS.CANCELLED className="size-3.5 text-current" /> },
    ];

    if (loading || status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="w-full h-full mx-auto space-y-4">
            <PageHeader
                title={t('orders.title')}
                description={t('orders.description')}
            />

            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                className={cn(
                                    'group inline-flex items-center gap-1.5 px-3 h-9 rounded-lg text-[14px] font-semibold cursor-pointer flex-shrink-0',
                                    'border border-black/15 dark:border-white/15',
                                    'bg-transparent',
                                    'focus:outline-none',
                                    'transition-all duration-300 ease-in-out',
                                    filter === 'all'
                                        ? 'text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white'
                                        : 'text-black dark:text-white',
                                )}
                            >
                                {filterOptions.find(o => o.key === filter)?.label}
                                <ChevronDown className={cn(
                                    'size-3 transition-transform duration-200 text-current',
                                    'group-data-[state=open]:rotate-180',
                                )} />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="start"
                            className="min-w-[160px] bg-brand-dropdown border-black/10 dark:border-white/10"
                        >
                            {filterOptions.map(opt => (
                                <DropdownMenuItem
                                    key={opt.key}
                                    onClick={() => setFilter(opt.key)}
                                    className={cn(
                                        'text-[13px] cursor-pointer gap-2',
                                        'hover:bg-transparent! focus:bg-transparent!',
                                        'transition-colors! duration-200 ease-in-out',
                                        filter === opt.key
                                            ? 'font-semibold text-black dark:text-white'
                                            : 'font-normal text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white',
                                    )}
                                >
                                    {opt.icon}
                                    {opt.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Popover>
                        <PopoverTrigger asChild>
                            <button
                                className={cn(
                                    'inline-flex items-center gap-1.5 px-3 h-9 rounded-lg text-[14px] font-semibold cursor-pointer flex-shrink-0',
                                    'border border-black/15 dark:border-white/15',
                                    'bg-transparent',
                                    'focus:outline-none',
                                    'transition-all duration-300 ease-in-out',
                                    (dateFrom || dateTo)
                                        ? 'text-black dark:text-white'
                                        : 'text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white',
                                )}
                            >
                                <Calendar className="size-3.5" />
                                {(dateFrom || dateTo) && (
                                    <span className="size-1.5 rounded-full bg-black dark:bg-white" />
                                )}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="start"
                            className="w-[280px] p-0 bg-brand-dropdown border-black/10 dark:border-white/10 overflow-hidden"
                        >
                            <div className="px-4 py-2.5 border-b border-black/[0.08] dark:border-white/[0.08]">
                                <span className="text-[13px] font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">
                                    {t('orders.dateRange.title')}
                                </span>
                            </div>
                            <div className="px-4 py-3 flex flex-wrap gap-1.5">
                                {([
                                    { label: t('orders.dateRange.today'), fn: () => { const d = new Date(); d.setHours(0,0,0,0); setDateFrom(d); setDateTo(d); } },
                                    { label: t('orders.dateRange.last7'), fn: () => { const to = new Date(); const from = new Date(to.getTime() - 6 * 86400000); from.setHours(0,0,0,0); to.setHours(0,0,0,0); setDateFrom(from); setDateTo(to); } },
                                    { label: t('orders.dateRange.last30'), fn: () => { const to = new Date(); const from = new Date(to.getTime() - 29 * 86400000); from.setHours(0,0,0,0); to.setHours(0,0,0,0); setDateFrom(from); setDateTo(to); } },
                                ]).map((preset) => (
                                    <button
                                        key={preset.label}
                                        onClick={preset.fn}
                                        className="px-2.5 py-1 rounded-md text-[12px] font-medium border border-black/10 dark:border-white/10 text-black/60 dark:text-white/60 hover:text-black/90 dark:hover:text-white/90 hover:border-black/25 dark:hover:border-white/25 transition-colors duration-150 cursor-pointer"
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>
                            <div className="h-px bg-black/[0.06] dark:bg-white/[0.06] mx-4" />
                            <div className="px-4 py-3 space-y-1">
                                <BirthDatePicker
                                    label={t('orders.dateRange.from')}
                                    isFloatingLabel={true}
                                    isMarginVisible={false}
                                    value={dateFrom}
                                    onDateChange={(d) => setDateFrom(d)}
                                    containerClass="w-full"
                                    buttonClass="w-full h-10 text-[13px]"
                                />
                                <BirthDatePicker
                                    label={t('orders.dateRange.to')}
                                    isFloatingLabel={true}
                                    isMarginVisible={false}
                                    value={dateTo}
                                    onDateChange={(d) => setDateTo(d)}
                                    containerClass="w-full"
                                    buttonClass="w-full h-10 text-[13px]"
                                />
                            </div>
                            {(dateFrom || dateTo) && (
                                <>
                                    <div className="h-px bg-black/[0.06] dark:bg-white/[0.06]" />
                                    <button
                                        onClick={() => { setDateFrom(undefined); setDateTo(undefined); }}
                                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-[13px] font-medium text-black/50 dark:text-white/50 hover:text-black/80 dark:hover:text-white/80 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors duration-150 cursor-pointer"
                                    >
                                        <X className="size-3.5" />
                                        {t('orders.dateRange.clear')}
                                    </button>
                                </>
                            )}
                        </PopoverContent>
                    </Popover>

                    <div className="group/search relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-black/30 dark:text-white/30 pointer-events-none transition-colors duration-200 group-focus-within/search:text-black/60 dark:group-focus-within/search:text-white/60" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder={t('orders.searchPlaceholder')}
                            className="w-full pl-9 pr-3 h-9 text-[14px] rounded-lg bg-transparent transition-all duration-200 border border-black/15 dark:border-white/15 focus:border-black/40 dark:focus:border-white/40 focus:outline-none text-black/90 dark:text-white/90 placeholder:text-black/30 dark:placeholder:text-white/30"
                        />
                    </div>
                </div>

                <span className="text-[14px] text-black/80 dark:text-white/80 flex-shrink-0">
                    {filtered.length} {t('orders.results')}
                </span>
            </div>

            <Card className="page-card overflow-hidden">
                <CardContent className="p-0">

                    {/* Table Header (Desktop) */}
                    <div className="hidden md:flex items-center gap-3 px-3 py-2.5 border-b border-border/40 dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02]">
                        <div className="flex-shrink-0" style={{ width: '20px' }} />
                        <div
                            className="grid flex-1 min-w-0 items-center"
                            style={{ gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, 0.5fr) minmax(0, 1fr) minmax(0, 1fr)', gap: '0 16px' }}
                        >
                            {([
                                { key: 'transactionCode' as SortKey, label: t('orders.col.orderCode'), align: '' },
                                { key: 'payment' as SortKey, label: t('orders.col.payment'), align: '' },
                                { key: 'amount' as SortKey, label: t('orders.col.amount'), align: 'justify-end' },
                                { key: 'currency' as SortKey, label: t('orders.col.currency'), align: '' },
                                { key: 'status' as SortKey, label: t('orders.col.status'), align: '' },
                                { key: 'time' as SortKey, label: t('orders.col.time'), align: '' },
                            ]).map((col, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        if (sortKey === col.key) {
                                            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
                                        } else {
                                            setSortKey(col.key);
                                            setSortDir(col.key === 'time' ? 'desc' : 'asc');
                                        }
                                    }}
                                    className={cn(
                                        'inline-flex items-center gap-1 text-[13px] font-semibold uppercase tracking-wider cursor-pointer transition-colors duration-150',
                                        col.align,
                                        sortKey === col.key
                                            ? 'text-black/80 dark:text-white/80'
                                            : 'text-black/40 dark:text-white/40 hover:text-black/60 dark:hover:text-white/60',
                                    )}
                                >
                                    {col.label}
                                    {sortKey === col.key ? (
                                        sortDir === 'asc'
                                            ? <ArrowUp className="size-3.5" />
                                            : <ArrowDown className="size-3.5" />
                                    ) : (
                                        <ArrowUpDown className="size-3.5 text-black/25 dark:text-white/25" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filtered.length === 0 ? (
                        <EmptyState
                            icon={<Package className="size-8" />}
                            title={transactions.length === 0 ? t('orders.empty.title') : t('orders.noResults')}
                            description={transactions.length === 0 ? t('orders.empty.description') : ''}
                        />
                    ) : (
                        <div>
                            {/* Desktop Rows */}
                            <div className="hidden md:block">
                                {paginated.map(tx => (
                                <TransactionRow
                                        key={tx.id}
                                        tx={tx}
                                        getStatusLabel={getStatusLabel}
                                        timeAgo={timeAgo}
                                        onToggleStar={(e) => handleToggleStar(tx, e)}
                                    />
                                ))}
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden">
                                {paginated.map(tx => (
                                    <TransactionCard
                                        key={tx.id}
                                        tx={tx}
                                        getStatusLabel={getStatusLabel}
                                        timeAgo={timeAgo}
                                        onToggleStar={(e) => handleToggleStar(tx, e)}
                                    />
                                ))}
                            </div>

                            {/* Load More */}
                            {showCount < filtered.length && (
                                <button
                                    onClick={() => setShowCount(prev => prev + ITEMS_PER_PAGE)}
                                    className="w-full py-3 text-[14px] font-semibold text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors duration-200 cursor-pointer border-b border-border/20 dark:border-white/[0.04]"
                                >
                                    {t('common.loadMore')} ({filtered.length - showCount})
                                </button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
