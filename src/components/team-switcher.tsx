import * as React from 'react';
import {
    SidebarGroup,
    useSidebar,
} from '@/components/ui/sidebar';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function NavHead({
    headers: data,
}: Readonly<{
    headers: {
        name: string;
        logo: React.ElementType | string;
        plan: string;
    }[];
}>) {
    const { open } = useSidebar();
    const teams = data[0];

    return (
        <SidebarGroup className="p-0">
            <Link
                href="/"
                className={cn(
                    'flex items-center gap-2 rounded-md transition-colors',
                    'hover:bg-transparent dark:hover:text-[var(--brand-color)]',
                    open ? 'px-0' : 'justify-center'
                )}
            >
                {/* Logo — 40×40, yellow bg + User icon */}
                <div className="shrink-0">
                    <div
                        className={cn(
                            'flex items-center justify-center rounded-lg border border-transparent bg-[#FFE400]',
                            'w-[40px] h-[40px]'
                        )}
                    >
                        <User size={24} strokeWidth={2.75} className="text-black" />
                    </div>
                </div>

                {/* Brand name + slogan — only when sidebar open */}
                {open && (
                    <div className="flex flex-col flex-1 text-left min-w-0">
                        <span className="truncate text-lg font-semibold leading-[1.2] text-black dark:text-[var(--brand-color)]">
                            {teams.name}
                        </span>
                        <span className="truncate text-sm font-semibold leading-[1.3] text-black/90 dark:text-white/90">
                            {teams.plan}
                        </span>
                    </div>
                )}
            </Link>
        </SidebarGroup>
    );
}
