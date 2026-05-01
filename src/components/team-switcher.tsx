import * as React from 'react';
import {
    SidebarGroup,
    useSidebar,
} from '@/components/ui/sidebar';
import Image from 'next/image';
import { LogoBrand } from '@image/index';
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
    const [logoError, setLogoError] = React.useState(false);
    const useCustomLogo = teams.logo && typeof teams.logo === 'string' && !logoError;

    return (
        <SidebarGroup className="p-0">
            <Link
                href="/home"
                className={cn(
                    'flex items-center gap-2 rounded-md transition-colors',
                    'hover:bg-transparent dark:hover:text-[var(--brand-color)]',
                    open ? 'px-0' : 'justify-center'
                )}
            >
                {/* Logo — 40×40, rounded-lg, border */}
                <div className="shrink-0">
                    {useCustomLogo ? (
                        <Image
                            src={teams.logo as string}
                            alt="Logo Brand"
                            width={40}
                            height={40}
                            className={cn(
                                'rounded-lg border border-border object-contain bg-sidebar',
                                'w-[40px] h-[40px]'
                            )}
                            onError={() => setLogoError(true)}
                        />
                    ) : (
                        <Image
                            src={LogoBrand}
                            alt="Logo Brand"
                            width={40}
                            height={40}
                            className={cn(
                                'rounded-lg border border-border bg-sidebar',
                                'w-[40px] h-[40px]'
                            )}
                        />
                    )}
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
