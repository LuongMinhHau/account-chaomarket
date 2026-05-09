'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
    GalleryVerticalEnd,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useI18n } from '@/context/i18n/context';

import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarRail,
    SidebarMenuSkeleton,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { NavUser } from '@/components/nav-user';
import { NavHead } from '@/components/team-switcher';
import { NavMain } from './nav-main';
import NavSeparator from './nav-separator';
import NavInformation from './nav-information';
import { SearchForm } from './search-form';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { status } = useSession();
    const { t, locale } = useI18n();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isLoading = !mounted || status === 'loading';

    const logoUrl = t('sidebar.logo');
    const isValidLogo = logoUrl && logoUrl !== 'sidebar.logo' && (logoUrl.startsWith('/') || logoUrl.startsWith('http') || logoUrl.startsWith('data:'));
    const displayLogo = isValidLogo ? logoUrl : GalleryVerticalEnd;

    const data = {
        headers: [
            {
                name: 'Chào Account',
                logo: displayLogo,
                plan: t('sidebar.brandGoal'),
            },
        ],
        items: [
            {
                title: t('account.notification'),
                url: '/notifications',
            },
            {
                title: t('account.profile'),
                url: '/profile',
            },
            {
                title: t('account.orderHistory'),
                url: '/order-history',
            },
            {
                title: t('account.security'),
                url: '/security',
            },
        ],
    };

    // Create loading skeletons for the sidebar content
    const renderLoadingSkeletons = () => {
        return (
            <>
                <SidebarHeader>
                    <SidebarMenuSkeleton
                        showIcon={true}
                        className="h-10 mb-2 [&>[data-sidebar=menu-skeleton-text]]:group-data-[collapsible=icon]:hidden"
                    />
                </SidebarHeader>
                <NavSeparator />
                <SidebarContent>
                    <div className="p-2 space-y-2">
                        {Array(6)
                            .fill(0)
                            .map((_, i) => (
                                <SidebarMenuSkeleton
                                    key={i}
                                    showIcon={true}
                                    className="[&>[data-sidebar=menu-skeleton-text]]:group-data-[collapsible=icon]:hidden"
                                />
                            ))}
                    </div>
                </SidebarContent>
                <SidebarRail />
            </>
        );
    };

    return (
        <Sidebar
            className={
                'border-border dark:border-[var(--brand-grey)] shadow-xl'
            }
            collapsible="icon"
            {...props}
        >
            {isLoading ? (
                renderLoadingSkeletons()
            ) : (
                <>
                    <SidebarHeader className="pt-3 px-3 pb-3.5 gap-3.5">
                        <NavHead headers={data.headers} />
                        <SearchForm />
                        <NavUser />
                    </SidebarHeader>
                    {/* Separator + Toggle — relative wrapper for auto-alignment */}
                    <div className="relative">
                        <NavSeparator isTrigger={false} />
                        <SidebarTrigger
                            className={
                                'absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 cursor-pointer z-21'
                            }
                        />
                    </div>
                    <SidebarContent>
                        <React.Suspense fallback={<SidebarMenuSkeleton />}>
                            <NavMain
                                items={data.items}
                                memberOnlyItem={null}
                            />
                        </React.Suspense>
                    </SidebarContent>
                    <NavSeparator isTrigger={false} className="my-2" />
                    <NavInformation
                        contactVisible={false}
                        languageVisible={true}
                        languageViVisible={true}
                        languageEnVisible={true}
                        themeVisible={true}
                        themeLightVisible={true}
                        themeDarkVisible={true}
                    />
                </>
            )}
        </Sidebar>
    );
}
