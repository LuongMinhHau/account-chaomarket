'use client';

import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

/**
 * Premium empty state component for pages with no data.
 * Gradient icon background + subtle float animation.
 */
export default function EmptyState({
    icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center py-16 px-6 text-center',
                'animate-in fade-in zoom-in-95 duration-500',
                className,
            )}
        >
            {/* Icon with gradient glow */}
            <div className="relative mb-5">
                <div className="absolute inset-0 bg-black/5 dark:bg-[var(--brand-color)]/20 rounded-full blur-xl scale-150 animate-pulse" />
                <div className="relative size-16 rounded-2xl bg-gradient-to-br from-black/8 to-black/3 dark:from-[var(--brand-color)]/10 dark:to-transparent flex items-center justify-center text-black/40 dark:text-[var(--brand-color)]/60">
                    {icon}
                </div>
            </div>

            <h3 className="text-lg font-semibold text-black/50 dark:text-white/50 mb-1.5">
                {title}
            </h3>

            {description && (
                <p className="text-sm text-muted-foreground max-w-sm mb-5 leading-relaxed">
                    {description}
                </p>
            )}

            {action && <div>{action}</div>}
        </div>
    );
}
