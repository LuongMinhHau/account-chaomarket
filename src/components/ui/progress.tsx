'use client';

import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';

function Progress({
    className,
    value,
    isValueVisible = false,
    leftLabel,
    rightLabel,
    ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
    isValueVisible?: boolean;
    leftLabel?: string;
    rightLabel?: string;
}) {
    const v = value || 0;
    const displayLabel = isValueVisible
        ? v >= 50
            ? `${leftLabel ? leftLabel + ': ' : ''}${v}%`
            : `${rightLabel ? rightLabel + ': ' : ''}${100 - v}%`
        : '';

    return (
        <ProgressPrimitive.Root
            data-slot="progress"
            className={cn(
                'bg-primary/20 relative h-5 w-full overflow-hidden rounded-sm',
                className
            )}
            {...props}
        >
            <ProgressPrimitive.Indicator
                data-slot="progress-indicator"
                className="bg-primary h-full w-full flex-1 transition-all"
                style={{
                    transform: `translateX(-${100 - v}%)`,
                }}
            />
            {isValueVisible && (
                <p className="absolute inset-0 flex items-center justify-center text-black text-[11px] font-semibold">
                    {displayLabel}
                </p>
            )}
        </ProgressPrimitive.Root>
    );
}

export { Progress };
