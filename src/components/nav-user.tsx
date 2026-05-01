'use client';

import { ChevronsUpDown, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useI18n } from '@/context/i18n/context';
import { T } from './app-translate';
import { useUnreadCount } from '@/hooks/react-query/notifications/use-notifications';

const ACCOUNTS_URL = process.env.NEXT_PUBLIC_ACCOUNTS_URL || '';

function UnreadBadge() {
    const { data } = useUnreadCount();
    const count = Number(data?.data ?? 0);
    if (!count) return null;
    return (
        <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
            {count > 9 ? '9+' : count}
        </span>
    );
}

export function NavUser() {
    const { isMobile, open } = useSidebar();
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const { t } = useI18n();

    // Unauthenticated: show Login / Sign-up buttons
    if (status === 'unauthenticated' && open) {
        const isLoginActive =
            pathname.startsWith('/auth/login') &&
            !pathname.startsWith('/auth/sign-up');
        const isSignupActive = pathname.startsWith('/auth/sign-up');

        const notMatchAllAuthPath = !isLoginActive && !isSignupActive;

        return (
            <SidebarMenu>
                <SidebarMenuItem className="flex gap-4">
                    <Button
                        asChild
                        variant="outline"
                        className={cn(
                            'flex-1/2 border border-black/20 dark:border-[var(--brand-grey-foreground)]/30' +
                            ' rounded-lg text-black font-bold transition-colors! duration-300 ease-in-out',
                            `${isLoginActive || notMatchAllAuthPath
                                ? 'dark:bg-[var(--brand-color)] bg-[var(--brand-color)]' +
                                ' dark:hover:bg-[var(--brand-color)] hover:bg-[var(--brand-color)] dark:hover:text-black'
                                : 'text-brand-text dark:hover:text-[var(--brand-color)]' +
                                ' hover:bg-[var(--brand-grey)]'
                            }`
                        )}
                    >
                        <Link href={`${ACCOUNTS_URL}/auth/login`}>{t('auth.login')}</Link>
                    </Button>
                    <Separator orientation="vertical" className="flex-0.5" />
                    <Button
                        asChild
                        variant="outline"
                        className={cn(
                            'flex-1/2 border border-black/20 dark:border-[var(--brand-grey-foreground)]/30' +
                            ' rounded-lg text-black font-bold transition-colors! duration-300 ease-in-out',
                            `${isSignupActive
                                ? 'dark:bg-[var(--brand-color)] bg-[var(--brand-color)]' +
                                ' dark:hover:bg-[var(--brand-color)] hover:bg-[var(--brand-color)] dark:hover:text-black'
                                : 'text-brand-text hover:bg-[var(--brand-grey)]' +
                                ' dark:hover:text-[var(--brand-color)]'
                            }`
                        )}
                    >
                        <Link href={`${ACCOUNTS_URL}/auth/sign-up`}>{t('auth.signup')}</Link>
                    </Button>
                </SidebarMenuItem>
            </SidebarMenu>
        );
    }

    const user = {
        avatar: session?.user?.image || '',
        name: session?.user?.name || 'User',
        email: session?.user?.email || 'user@example.com',
    };

    return (
        status === 'authenticated' && (
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className={`data-[state=open]:text-sidebar-accent-foreground text-black dark:text-black ${open ? 'bg-[var(--brand-color)] dark:bg-[var(--brand-color)] border border-black/30 dark:border-black/30 hover:bg-[var(--brand-color)] dark:hover:bg-[var(--brand-color)] hover:text-black dark:hover:text-black' : ''}`}
                                tooltip={
                                    <p className={'font-semibold'}>
                                        {user.name}
                                    </p>
                                }
                            >
                                <div className="relative">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage
                                            src={user.avatar}
                                            alt={user.name}
                                        />
                                        <AvatarFallback className="rounded-lg bg-black text-sm font-semibold dark:text-[var(--brand-color)] text-[var(--brand-color)]">
                                            {user.name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <UnreadBadge />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold text-black">
                                        {user.name}
                                    </span>
                                    <span className="truncate text-xs font-medium text-black/90">
                                        {user.email}
                                    </span>
                                </div>
                                <ChevronsUpDown className="ml-auto size-4" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 bg-brand-dialog rounded-lg"
                            side={isMobile ? 'bottom' : 'right'}
                            align="start"
                            sideOffset={12}
                        >
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center px-1 py-1.5 text-left text-sm">
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate text-sm text-brand-text dark:text-[var(--brand-color)] font-semibold">
                                            {user.name}
                                        </span>
                                        <span className="truncate text-sm font-normal">
                                            {user.email}
                                        </span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className={
                                    'text-sm font-medium hover:bg-transparent' +
                                    ' dark:hover:text-[var(--brand-color)]!' +
                                    ' dark:hover:[&>svg]:stroke-[var(--brand-color)]' +
                                    ' transition-colors! duration-200' +
                                    ' ease-in-out cursor-pointer'
                                }
                            >
                                <LogOut className="text-foreground" />
                                <T keyName={'common.logOut'} />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        )
    );
}
