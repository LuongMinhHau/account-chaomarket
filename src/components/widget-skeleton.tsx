'use client';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

/**
 * WidgetSkeleton — Beautiful loading placeholder for third-party widgets.
 * Mimics the layout of TradingView charts and data tables with shimmer animation.
 */
export function WidgetSkeleton({
    height = '42rem',
    variant = 'chart',
}: {
    height?: string;
    variant?: 'chart' | 'table' | 'iframe';
}) {
    if (variant === 'table') {
        return (
            <div className="w-full rounded-lg p-4 space-y-3" style={{ height }}>
                {/* Table header */}
                <div className="flex gap-4 mb-4">
                    <Skeleton className="h-8 w-24 rounded" />
                    <Skeleton className="h-8 w-20 rounded" />
                    <Skeleton className="h-8 w-28 rounded" />
                    <Skeleton className="h-8 w-16 rounded" />
                </div>
                {/* Table rows */}
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="flex gap-4 items-center">
                        <Skeleton className="h-5 w-16 rounded" />
                        <Skeleton className="h-5 w-20 rounded" />
                        <Skeleton className="h-5 w-24 rounded" />
                        <Skeleton className="h-5 w-16 rounded" />
                        <Skeleton className="h-5 flex-1 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    if (variant === 'iframe') {
        return (
            <div className="w-full rounded-lg p-4 space-y-4" style={{ height }}>
                {/* Toolbar */}
                <div className="flex gap-3">
                    <Skeleton className="h-9 w-32 rounded-md" />
                    <Skeleton className="h-9 w-24 rounded-md" />
                    <Skeleton className="h-9 flex-1 rounded-md" />
                </div>
                {/* Main content area */}
                <Skeleton className="w-full flex-1 rounded-md" style={{ height: 'calc(100% - 60px)' }} />
            </div>
        );
    }

    // variant === 'chart'
    return (
        <div className="w-full rounded-lg p-4 space-y-3" style={{ height }}>
            {/* Chart header */}
            <div className="flex justify-between items-center">
                <div className="flex gap-3">
                    <Skeleton className="h-7 w-24 rounded" />
                    <Skeleton className="h-7 w-16 rounded" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-7 w-10 rounded" />
                    <Skeleton className="h-7 w-10 rounded" />
                    <Skeleton className="h-7 w-10 rounded" />
                </div>
            </div>
            {/* Price */}
            <Skeleton className="h-10 w-48 rounded" />
            {/* Chart area */}
            <div className="flex-1 relative" style={{ height: 'calc(100% - 120px)' }}>
                <Skeleton className="w-full h-full rounded-md" />
            </div>
            {/* Bottom toolbar */}
            <div className="flex gap-2 pt-2">
                <Skeleton className="h-6 w-12 rounded" />
                <Skeleton className="h-6 w-12 rounded" />
                <Skeleton className="h-6 w-12 rounded" />
                <Skeleton className="h-6 w-12 rounded" />
                <Skeleton className="h-6 w-12 rounded" />
            </div>
        </div>
    );
}
