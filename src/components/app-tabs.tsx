'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export type TabItem = {
    title: string | React.ReactNode;
    value: string;
    renderContent: () => Promise<React.ReactNode>;
};

type TabComponentProps = {
    tabsList: TabItem[];
    shouldBorderVisible?: boolean;
    isHorizontal?: boolean;
    defaultValue?: string;
    value?: string;
    size?: number;
    onValueChange?: (activeTab: string) => void;
    tabContainerClassName?: string;
    fontSize?: string; // Tailwind font size class, e.g. 'text-xs md:text-base'
    keepMounted?: boolean; // When true, keep visited tab content in DOM (hidden) instead of unmounting
};

export function AppTabs({
    tabsList,
    shouldBorderVisible = true,
    isHorizontal = false,
    defaultValue,
    value,
    onValueChange,
    tabContainerClassName,
    fontSize = 'text-[12px]! md:text-[14px]!',
    keepMounted = false,
}: Readonly<TabComponentProps>) {
    const [activeTab, setActiveTab] = useState(
        value || defaultValue || tabsList[0]?.value
    );
    const [contentMap, setContentMap] = useState<
        Record<string, React.ReactNode>
    >({});

    // Sync with controlled value prop
    useEffect(() => {
        if (value !== undefined && value !== activeTab) {
            setActiveTab(value);
        }
    }, [value, activeTab]);

    useEffect(() => {
        if (
            tabsList.length > 0 &&
            tabsList.find(t => t.value === activeTab) === undefined
        ) {
            setActiveTab(tabsList[0].value);
            setContentMap({});
        }
    }, [tabsList, activeTab]);

    useEffect(() => {
        const loadContent = async () => {
            const tab = tabsList.find(t => t.value === activeTab);
            if (tab && !contentMap[activeTab]) {
                const content = await tab.renderContent();
                setContentMap(prev => ({ ...prev, [activeTab]: content }));
            }
        };

        loadContent();
    }, [activeTab, tabsList, contentMap]);

    return (
        <Tabs
            value={activeTab}
            onValueChange={newValue => {
                setActiveTab(newValue);
                onValueChange?.(newValue);
            }}
            className="w-full gap-1"
            orientation={isHorizontal ? 'horizontal' : 'vertical'}
        >
            <TabsList
                className={cn(
                    'bg-transparent [&>button:last-child]:mr-0' +
                        ' rounded-none p-0 mb-0 w-fit h-auto' +
                        ' overflow-x-auto overflow-y-hidden no-scrollbar' +
                        ' lg:overflow-visible',
                    `${shouldBorderVisible ? 'border-b border-[var(--tab-separator)]' : 'border-transparent'}`
                )}
            >
                {tabsList.map(tab => (
                    <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        style={{
                            width: `calc(100% / ${tabsList.length})px`,
                            maxWidth: `calc(100% / ${tabsList.length})px`,
                            minWidth: `calc(100% / ${tabsList.length})px`,
                        }}
                        className={cn(
                            'group/tab relative h-auto' +
                                ' data-[state=active]:shadow-none' +
                                ' data-[state=active]:bg-transparent!' +
                                ' border-0 cursor-pointer rounded-none' +
                                ' dark:data-[state=active]:bg-transparent!',
                            'px-1 mr-12 pt-2 pb-0',
                            fontSize,
                            `${shouldBorderVisible ? '' : 'border-transparent!'}`,
                            // Text color & font-weight via CSS data-state selectors (sync with underline)
                            // Use ! (important) to override shadcn's default dark:text-muted-foreground
                            'text-[var(--tab-inactive-text)]! font-[var(--tab-font-weight-inactive)]!',
                            'data-[state=active]:text-[var(--tab-active-text)]! data-[state=active]:font-[var(--tab-font-weight-active)]!',
                            'hover:not-data-[state=active]:text-[var(--tab-hover-text)]!'
                        )}
                    >
                        <span className="relative inline-block pb-1">
                            {tab.title}
                            <span
                                className={cn(
                                    'absolute left-1/2 -translate-x-1/2 bottom-0 h-[2px] w-full rounded-full',
                                    'transition-opacity duration-300 ease-in-out',
                                    'opacity-0 group-data-[state=active]/tab:opacity-100 group-hover/tab:opacity-100'
                                )}
                                style={{
                                    backgroundColor:
                                        'var(--tab-active-underline)',
                                }}
                            />
                        </span>
                    </TabsTrigger>
                ))}
            </TabsList>

            {keepMounted
                ? Object.keys(contentMap).map(key => (
                      <TabsContent
                          key={key}
                          value={key}
                          forceMount
                          className={cn(
                              tabContainerClassName,
                              activeTab !== key && 'hidden'
                          )}
                      >
                          {contentMap[key]}
                      </TabsContent>
                  ))
                : tabsList.map(tab => (
                      <TabsContent
                          key={tab.value}
                          value={tab.value}
                          className={tabContainerClassName}
                      >
                          {contentMap[tab.value] ?? (
                              <div className="text-muted">Loading...</div>
                          )}
                      </TabsContent>
                  ))}
        </Tabs>
    );
}
