'use client';

import { cn } from '@/lib/utils';

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

/**
 * Standardized page header for all account pages.
 * Provides a consistent title + description + optional action layout.
 */
export default function PageHeader({
    title,
    description,
    action,
    className,
}: PageHeaderProps) {
    return (
        <div className={cn('mb-6 animate-in fade-in slide-in-from-top-2 duration-500', className)}>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-[16px] text-black/70 dark:text-white/70 mt-1">
                            {description}
                        </p>
                    )}
                </div>
                {action && <div className="flex-shrink-0">{action}</div>}
            </div>
        </div>
    );
}
