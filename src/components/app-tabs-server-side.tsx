'use client';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

export interface TabServerSide {
    title: string | ReactNode;
    href: string;
}

interface AppTabsServerSideProps {
    tabs: TabServerSide[];
    currentSearchParams: string;
    isParentOfSubTab?: boolean;
    isSubTab?: boolean;
    currentHref?: string;
    subTabClassName?: string;
    size?: number;
    fontSize?: string; // Tailwind font size class, e.g. 'text-xs md:text-base'
    onTabClick?: (href: string, e: React.MouseEvent) => void; // Client-side tab switch callback
}

export default function AppTabsServerSide({
    tabs,
    currentSearchParams,
    isParentOfSubTab = false,
    currentHref,
    subTabClassName = '',
    size = 1,
    fontSize = 'text-xs md:text-base',
    onTabClick,
}: AppTabsServerSideProps) {
    // Parse current search params
    const searchParams = new URLSearchParams(currentSearchParams);

    // Get current tab values from URL parameters
    const currentType = searchParams.get('type') || '';
    const currentFilterBy = searchParams.get('filterBy') || '';
    const currentMainTag = searchParams.get('mainTag') || '';
    const currentTab = searchParams.get('tab') || '';

    // Find the current tab by matching the tab href with current parameters
    const getCurrentTabHref = () => {
        // Build current URL params string for comparison
        const currentParams = new URLSearchParams();
        if (currentType) currentParams.set('type', currentType);
        if (currentFilterBy) currentParams.set('filterBy', currentFilterBy);
        if (currentMainTag) currentParams.set('mainTag', currentMainTag);
        if (currentTab) currentParams.set('tab', currentTab);

        const currentParamString = currentParams.toString();

        // If no params, find the "All" tab (no type, filterBy, or mainTag)
        if (!currentParamString) {
            const allTab = tabs.find(
                tab =>
                    !tab.href.includes('type=') &&
                    !tab.href.includes('filterBy=') &&
                    !tab.href.includes('mainTag=') &&
                    !tab.href.includes('tab=')
            );
            return allTab ? allTab.href : tabs[0]?.href;
        }

        // Try to find exact match with current parameters (order-independent)
        const matchingTab = tabs.find(tab => {
            try {
                const tabUrl = new URL(tab.href, 'http://localhost');
                const tabParams = tabUrl.searchParams;

                // Compare each tab-relevant parameter individually
                const tabType = tabParams.get('type') || '';
                const tabFilterBy = tabParams.get('filterBy') || '';
                const tabMainTag = tabParams.get('mainTag') || '';
                const tabTab = tabParams.get('tab') || '';

                return (
                    tabType === currentType &&
                    tabFilterBy === currentFilterBy &&
                    tabMainTag === currentMainTag &&
                    tabTab === currentTab
                );
            } catch {
                return false;
            }
        });

        // If exact match found, return it
        if (matchingTab) {
            return matchingTab.href;
        }

        // Fallback logic - match based on priority
        if (currentMainTag) {
            const matchingTab = tabs.find(tab =>
                tab.href.includes(`mainTag=${currentMainTag}`)
            );
            return matchingTab ? matchingTab.href : tabs[0]?.href;
        } else if (currentType) {
            const matchingTab = tabs.find(tab =>
                tab.href.includes(`type=${currentType}`)
            );
            return matchingTab ? matchingTab.href : tabs[0]?.href;
        } else if (currentFilterBy) {
            const matchingTab = tabs.find(tab =>
                tab.href.includes(`filterBy=${currentFilterBy}`)
            );
            return matchingTab ? matchingTab.href : tabs[0]?.href;
        } else if (currentTab) {
            const matchingTab = tabs.find(tab =>
                tab.href.includes(`tab=${currentTab}`)
            );
            return matchingTab ? matchingTab.href : tabs[0]?.href;
        }

        return tabs[0]?.href;
    };

    const currentTabHref = currentHref ?? getCurrentTabHref();

    return (
        <div className={isParentOfSubTab ? 'mb-1' : cn('mb-8', subTabClassName)}>
            <div>
                <nav className="flex w-fit space-x-6 md:space-x-12 overflow-x-auto no-scrollbar border-b border-[var(--tab-separator)]">
                    {tabs.map(tab => {
                        const tabPath = tab.href.split('?')[0];
                        const currentPath = currentTabHref?.split('?')[0];
                        const tabQuery = tab.href.split('?')[1] || '';
                        const currentQuery = currentTabHref?.split('?')[1] || '';
                        const isActive = tabPath === currentPath && tabQuery === currentQuery;

                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                onClick={onTabClick ? (e) => { e.preventDefault(); onTabClick(tab.href, e); } : undefined}
                                className={cn(
                                    'group/tab relative whitespace-nowrap px-1 text-center',
                                    'pb-0 pt-1 md:pt-2',
                                    fontSize,
                                )}
                                style={{
                                    color: isActive
                                        ? 'var(--tab-active-text)'
                                        : 'var(--tab-inactive-text)',
                                    fontWeight: (isActive
                                        ? 'var(--tab-font-weight-active)'
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        : 'var(--tab-font-weight-inactive)') as any,
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) e.currentTarget.style.color = 'var(--tab-hover-text)';
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) e.currentTarget.style.color = 'var(--tab-inactive-text)';
                                }}
                            >
                                <span className="relative inline-block pb-1 capitalize">
                                    {tab.title}
                                    <span
                                        className={cn(
                                            "absolute left-1/2 -translate-x-1/2 bottom-0 h-[2px] rounded-full",
                                            "transition-opacity duration-300 ease-in-out",
                                            size >= 2 ? 'w-full' : size === 1 ? 'w-1/2' : 'w-1/3',
                                            isActive
                                                ? "opacity-100"
                                                : "opacity-0 group-hover/tab:opacity-100"
                                        )}
                                        style={{ backgroundColor: 'var(--tab-active-underline)' }}
                                    />
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
