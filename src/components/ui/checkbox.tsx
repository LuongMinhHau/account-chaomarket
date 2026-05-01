'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

function Checkbox({
    className,
    ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
    return (
        <CheckboxPrimitive.Root
            data-slot="checkbox"
            className={cn(
                'peer shrink-0 size-[15px] rounded-[3px] border-[1.5px] transition-all duration-150 outline-none overflow-hidden relative',
                'border-black/30 dark:border-white/40',
                'data-[state=checked]:border-black dark:data-[state=checked]:border-white',
                'data-[state=checked]:text-black dark:data-[state=checked]:text-white',
                'focus-visible:ring-2 focus-visible:ring-[var(--brand-color)]/30',
                'disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}
        >
            <CheckboxPrimitive.Indicator
                data-slot="checkbox-indicator"
                className="flex items-center justify-center text-current transition-none"
            >
                <CheckIcon className="size-3" strokeWidth={2.5} />
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    );
}

export { Checkbox };
