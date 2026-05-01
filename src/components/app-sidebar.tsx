'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
    UserRound,
    ShieldCheck,
    Bell,
    Receipt,
    Scale,
    Eye,
    GalleryVerticalEnd,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useI18n } from '@/context/i18n/context';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
    SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import { NavUser } from '@/components/nav-user';
import { NavHead } from '@/components/team-switcher';
import { NavMain } from './nav-main';
import NavSeparator from './nav-separator';
import NavInformation from './nav-information';
import { SearchForm } from './search-form';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { status } = useSession();
    const { t } = useI18n();
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
                url: '/account/notifications',
                icon: Bell,
            },
            {
                title: t('account.profile'),
                url: '/account/profile',
                icon: UserRound,
            },
            {
                title: t('account.orderHistory'),
                url: '/account/orders',
                icon: Receipt,
            },
            {
                title: t('account.security'),
                url: '/account/security',
                icon: ShieldCheck,
            },
            {
                title: t('account.privacy'),
                url: '/account/privacy',
                icon: Eye,
            },
            {
                title: t('account.legalCompliance'),
                url: '/account/legal',
                icon: Scale,
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
                <NavSeparator isTrigger={false} className="my-2" />
                <div className="p-2 space-y-2">
                    {Array(3)
                        .fill(0)
                        .map((_, i) => (
                            <SidebarMenuSkeleton
                                key={i}
                                showIcon={true}
                                className="[&>[data-sidebar=menu-skeleton-text]]:group-data-[collapsible=icon]:hidden"
                            />
                        ))}
                </div>
                <SidebarFooter>
                    <div className="p-2">
                        <SidebarMenuSkeleton
                            showIcon={true}
                            className="h-12 [&>[data-sidebar=menu-skeleton-text]]:group-data-[collapsible=icon]:hidden"
                        />
                    </div>
                </SidebarFooter>
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
                    <SidebarHeader className="p-2">
                        <NavHead headers={data.headers} />
                        <div className="mb-0">
                            <SearchForm />
                        </div>
                        <NavUser />
                    </SidebarHeader>
                    <NavSeparator />
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
                        contactVisible={true}
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
