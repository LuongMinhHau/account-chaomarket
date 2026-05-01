'use client';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Reusable content skeleton components for data-heavy sections.
 * Each variant mimics the actual layout of its target component.
 */

/** Skeleton for notification rows (Gmail-style: checkbox + star + 4-col grid) */
export function NotificationsSkeleton({ rows = 6 }: { rows?: number }) {
    return (
        <div className="space-y-0">
            {/* Toolbar skeleton */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/40 dark:border-white/[0.08]">
                <div className="flex items-center gap-2">
                    <Skeleton className="size-4 rounded-sm" />
                    <Skeleton className="h-5 w-20 rounded" />
                </div>
                <Skeleton className="h-7 w-28 rounded" />
            </div>
            {/* Column header skeleton */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/40 dark:border-white/[0.08]">
                <div className="flex-shrink-0" style={{ width: 'calc(16px + 8px + 16px + 8px)' }} />
                <div className="grid flex-1" style={{ gridTemplateColumns: '250px 1fr 80px 230px', gap: '0 12px' }}>
                    <Skeleton className="h-4 w-14 rounded" />
                    <Skeleton className="h-4 w-16 rounded" />
                    <Skeleton className="h-4 w-10 rounded" />
                    <Skeleton className="h-4 w-16 rounded ml-auto" />
                </div>
            </div>
            {/* Row skeletons */}
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2.5 border-b border-border/30 dark:border-white/[0.06]">
                    <Skeleton className="size-4 rounded-sm flex-shrink-0" />
                    <Skeleton className="size-4 rounded-sm flex-shrink-0" />
                    <div className="grid flex-1 items-center" style={{ gridTemplateColumns: '250px 1fr 80px 230px', gap: '0 12px' }}>
                        <Skeleton className="h-4 rounded" style={{ width: `${60 + Math.random() * 30}%` }} />
                        <Skeleton className="h-4 rounded" style={{ width: `${40 + Math.random() * 40}%` }} />
                        <Skeleton className="h-4 w-14 rounded" />
                        <Skeleton className="h-4 w-24 rounded ml-auto" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/** Skeleton for order history table (7-column grid rows) */
export function OrderHistorySkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-3 py-2">
                <Skeleton className="h-5 w-36 rounded" />
                <Skeleton className="h-5 w-20 rounded" />
            </div>
            <div className="rounded-lg border border-border/40 dark:border-white/[0.08] overflow-hidden">
                {/* Table header */}
                <div
                    className="grid items-center px-3 py-2.5 gap-x-3 border-b border-border/40 dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02]"
                    style={{ gridTemplateColumns: '115px 1fr 170px 35px 120px 90px 230px' }}
                >
                    {['w-16', 'w-16', 'w-14', 'w-6', 'w-14', 'w-14', 'w-16'].map((w, i) => (
                        <Skeleton key={i} className={`h-4 ${w} rounded`} />
                    ))}
                </div>
                {/* Rows */}
                {Array.from({ length: rows }).map((_, i) => (
                    <div
                        key={i}
                        className="grid items-center px-3 py-3 gap-x-3 border-b border-border/30 dark:border-white/[0.06]"
                        style={{ gridTemplateColumns: '115px 1fr 170px 35px 120px 90px 230px' }}
                    >
                        <Skeleton className="h-4 w-24 rounded" />
                        <Skeleton className="h-4 rounded" style={{ width: `${50 + Math.random() * 40}%` }} />
                        <Skeleton className="h-4 w-32 rounded" />
                        <Skeleton className="h-4 w-4 rounded ml-auto" />
                        <Skeleton className="h-4 w-20 rounded ml-auto" />
                        <Skeleton className="h-4 w-16 rounded mx-auto" />
                        <Skeleton className="h-4 w-28 rounded ml-auto" />
                    </div>
                ))}
            </div>
        </div>
    );
}

/** Skeleton for product/service card grid */
export function ProductCardsSkeleton({ count = 8, columns = 4 }: { count?: number; columns?: number }) {
    const gridClass = columns === 3
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';

    return (
        <div className="w-full">
            {/* Toolbar skeleton */}
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-16 rounded" />
                    <Skeleton className="h-6 w-20 rounded" />
                </div>
                <Skeleton className="h-5 w-32 rounded" />
            </div>
            <div className={`grid ${gridClass}`}>
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="flex flex-col rounded-xl border border-black/10 dark:border-[var(--brand-grey)] bg-neutral-50/90 dark:bg-white/[0.045] overflow-hidden min-h-[320px]">
                        {/* Image placeholder */}
                        <Skeleton className="w-full h-28 rounded-none" />
                        {/* Content */}
                        <div className="px-3 pt-4 pb-2 flex flex-col gap-3 flex-1">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <Skeleton className="h-3 w-12 rounded" />
                                    <Skeleton className="h-3 w-14 rounded" />
                                </div>
                                <Skeleton className="h-3 w-10 rounded" />
                            </div>
                            <Skeleton className="h-5 w-3/4 rounded" />
                            <Skeleton className="h-4 w-full rounded" />
                            <Skeleton className="h-4 w-2/3 rounded" />
                        </div>
                        {/* Footer */}
                        <div className="px-3 pb-2 mt-auto">
                            <hr className="mb-2 border-black/8 dark:border-white/10" />
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-5 w-24 rounded" />
                                <div className="flex gap-1.5">
                                    <Skeleton className="h-7 w-14 rounded-lg" />
                                    <Skeleton className="h-7 w-10 rounded-lg" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/** Skeleton for news feed cards (vertical list of article cards) */
export function NewsFeedSkeleton({ rows = 6 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-lg border border-border/30 dark:border-white/[0.06]">
                    <Skeleton className="w-24 h-20 rounded-md flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4 rounded" />
                        <Skeleton className="h-3 w-full rounded" />
                        <Skeleton className="h-3 w-1/2 rounded" />
                        <div className="flex items-center gap-2 pt-1">
                            <Skeleton className="h-3 w-20 rounded" />
                            <Skeleton className="h-3 w-24 rounded" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

/** Skeleton for social media feed cards (YouTube/TikTok/Facebook) */
export function SocialFeedSkeleton({ count = 4, variant = 'horizontal' }: { count?: number; variant?: 'horizontal' | 'vertical' }) {
    if (variant === 'vertical') {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className="flex flex-col rounded-xl overflow-hidden border border-border/30 dark:border-white/[0.06]">
                        <Skeleton className="w-full aspect-[3/4] rounded-none" />
                        <div className="p-3 space-y-2">
                            <Skeleton className="h-4 w-3/4 rounded" />
                            <Skeleton className="h-3 w-full rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex flex-col rounded-xl overflow-hidden border border-border/30 dark:border-white/[0.06]">
                    <Skeleton className="w-full aspect-video rounded-none" />
                    <div className="p-3 space-y-2">
                        <Skeleton className="h-4 w-3/4 rounded" />
                        <Skeleton className="h-3 w-full rounded" />
                        <Skeleton className="h-3 w-1/2 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

/** Skeleton for stats cards + chart (Members Only Performance) */
export function PerformanceSkeleton() {
    return (
        <div className="space-y-4">
            {/* Stats cards row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-lg border border-border/30 dark:border-white/[0.06] p-4 space-y-2">
                        <Skeleton className="h-3 w-16 rounded" />
                        <Skeleton className="h-6 w-24 rounded" />
                        <Skeleton className="h-3 w-12 rounded" />
                    </div>
                ))}
            </div>
            {/* Chart area */}
            <div className="rounded-lg border border-border/30 dark:border-white/[0.06] p-4">
                <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-5 w-32 rounded" />
                    <div className="flex gap-2">
                        <Skeleton className="h-7 w-10 rounded" />
                        <Skeleton className="h-7 w-10 rounded" />
                        <Skeleton className="h-7 w-10 rounded" />
                    </div>
                </div>
                <Skeleton className="w-full h-64 rounded-md" />
            </div>
        </div>
    );
}
