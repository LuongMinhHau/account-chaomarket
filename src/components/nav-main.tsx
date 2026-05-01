'use client';

import { ChevronRight, LucideProps } from 'lucide-react';
import { useState, useEffect, useContext, createContext } from 'react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

// Create context to manage single open collapsible
const CollapsibleContext = createContext<{
    openItemId: string | null;
    setOpenItemId: (id: string | null) => void;
}>({
    openItemId: null,
    setOpenItemId: () => {},
});

export function NavMain({
    items,
    memberOnlyItem,
}: Readonly<{
    items: {
        title: string;
        url: string;
        icon: React.ForwardRefExoticComponent<
            Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
        >;
        children?: {
            title: string;
            url: string;
        }[];
    }[];
    memberOnlyItem: {
        title: string;
        url: string;
        icon: React.ForwardRefExoticComponent<
            Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
        >;
        children: {
            title: string;
            url: string;
        }[];
    } | null;
}>) {
    const pathname = usePathname();
    const params = useSearchParams();
    const [path, setPath] = useState(pathname);

    // Update path with search params after hydration to avoid mismatch
    useEffect(() => {
        if (params && pathname.includes('/chao-insights')) {
            setPath(pathname + '?' + new URLSearchParams(params).toString());
        } else {
            setPath(pathname);
        }
    }, [pathname, params]);

    const [openItemId, setOpenItemId] = useState<string | null>(null);

    // Find which item should be open based on current path
    useEffect(() => {
        // Check main items
        const activeItem = items.find(item => {
            if (item.children) {
                if (item.children.some(child => path.startsWith(child.url)))
                    return true;
                // Parent-path prefix matching (e.g., /investment-calculators/profit-metrics/)
                if (item.children.some(child => {
                    const parentPath = child.url.split('/').slice(0, -1).join('/');
                    return parentPath && path.startsWith(parentPath + '/');
                })) return true;
                return path.startsWith(item.url);
            }
            return path.startsWith(item.url);
        });

        if (activeItem) {
            setOpenItemId(activeItem.title);
            return;
        }

        // Check member-only item
        if (memberOnlyItem) {
            const isMemberActive =
                path.startsWith(memberOnlyItem.url) ||
                memberOnlyItem.children.some(child =>
                    path.startsWith(child.url)
                );
            if (isMemberActive) {
                setOpenItemId(memberOnlyItem.title);
            }
        }
    }, [path, items, memberOnlyItem]);

    const router = useRouter();

    const handleMemberClick = () => {
        if (!memberOnlyItem) return;
        if (path.startsWith('/members-only')) {
            // We're already in members-only, toggle the collapsible
            setOpenItemId(
                openItemId === memberOnlyItem.title
                    ? null
                    : memberOnlyItem.title
            );
        } else {
            // Navigate to first submenu and open
            router.push(memberOnlyItem.url);
            setOpenItemId(memberOnlyItem.title);
        }
    };

    return (
        <CollapsibleContext.Provider value={{ openItemId, setOpenItemId }}>
            <SidebarGroup className="sidebar-scroll">
                <SidebarMenu className="sidebar-scroll">
                    {items.map(item => (
                        <CollapsibleItem
                            key={item.title}
                            item={item}
                            path={path}
                            allItems={items}
                        />
                    ))}
                </SidebarMenu>
            </SidebarGroup>

            {/* Member-only section */}
            {memberOnlyItem && (
                <SidebarGroup className="sidebar-scroll mt-4">
                    <SidebarMenu className="sidebar-scroll">
                        <Collapsible
                            asChild
                            open={openItemId === memberOnlyItem.title}
                            className='group/collapsible [&>button[data-slot="collapsible-trigger"]]:rounded-none [&>button[data-active=true]]:border-l-6 dark:[&>button[data-active=true]]:border-[var(--brand-color)] [&>button[data-active=true]]:border-brand-text [&>button[data-active=true]]:rounded-none [&>button]:cursor-pointer dark:[&>button[data-active=true]]:bg-[var(--brand-color)]/5'
                        >
                            <SidebarMenuItem className={'font-medium'}>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton
                                        tooltip={
                                            <div className="flex flex-col gap-1 p-2">
                                                <div
                                                    className="font-semibold mb-1.5 cursor-pointer dark:hover:text-[var(--brand-color)]"
                                                    onClick={() =>
                                                        router.push(
                                                            memberOnlyItem.url
                                                        )
                                                    }
                                                >
                                                    {memberOnlyItem.title}
                                                </div>
                                                {memberOnlyItem.children.map(
                                                    subItem => (
                                                        <div
                                                            key={subItem.title}
                                                            onClick={() =>
                                                                router.push(
                                                                    subItem.url
                                                                )
                                                            }
                                                            className="dark:hover:text-[var(--brand-color)] text-[var(--brand-grey-foreground)] hover:text-brand-text cursor-pointer"
                                                        >
                                                            {subItem.title}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        }
                                        isActive={path.startsWith(
                                            '/members-only'
                                        )}
                                        onClick={handleMemberClick}
                                        className={
                                            'text-[16px] data-[active=true]:font-semibold'
                                        }
                                    >
                                        {memberOnlyItem.icon && (
                                            <memberOnlyItem.icon />
                                        )}
                                        <span>{memberOnlyItem.title}</span>
                                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent className="overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                                    <SidebarMenuSub
                                        style={{ borderLeft: 'none' }}
                                        className="pl-5 ml-4.5 relative before:absolute before:left-1.5 before:top-0 before:bottom-3 before:w-px before:bg-[#999] dark:before:bg-[#555]"
                                    >
                                        {memberOnlyItem.children.map(
                                            (subItem, index) => {
                                                const isSubActive = (() => {
                                                    // Exact match always wins
                                                    if (path === subItem.url) {
                                                        // But if this is the parent-level URL, check no sibling is more specific
                                                        if (
                                                            subItem.url ===
                                                            memberOnlyItem.url
                                                        ) {
                                                            const moreSpecificSibling =
                                                                memberOnlyItem.children.find(
                                                                    s =>
                                                                        s.url !==
                                                                            subItem.url &&
                                                                        (path ===
                                                                            s.url ||
                                                                            path.startsWith(
                                                                                s.url +
                                                                                    '/'
                                                                            ))
                                                                );
                                                            return !moreSpecificSibling;
                                                        }
                                                        return true;
                                                    }
                                                    // Prefix match — but only if no sibling is more specific
                                                    if (
                                                        path.startsWith(
                                                            subItem.url + '/'
                                                        )
                                                    ) {
                                                        const moreSpecificSibling =
                                                            memberOnlyItem.children.find(
                                                                s =>
                                                                    s.url !==
                                                                        subItem.url &&
                                                                    s.url
                                                                        .length >
                                                                        subItem
                                                                            .url
                                                                            .length &&
                                                                    (path ===
                                                                        s.url ||
                                                                        path.startsWith(
                                                                            s.url +
                                                                                '/'
                                                                        ))
                                                            );
                                                        return !moreSpecificSibling;
                                                    }
                                                    return false;
                                                })();
                                                const activeLine = isSubActive
                                                    ? '!bg-[var(--brand-text)] dark:!bg-[var(--brand-color)] !w-[1.5px]'
                                                    : '';
                                                const activeHLine = isSubActive
                                                    ? '!bg-[var(--brand-text)] dark:!bg-[var(--brand-color)] !h-[1.5px]'
                                                    : '';
                                                return (
                                                    <SidebarMenuSubItem
                                                        key={subItem.title}
                                                        className={
                                                            'cursor-pointer relative'
                                                        }
                                                    >
                                                        <span
                                                            className={`absolute left-[-14px] top-0 h-1/2 w-px bg-[#999] dark:bg-[#555] ${activeLine}`}
                                                        ></span>
                                                        {index !==
                                                            memberOnlyItem
                                                                .children
                                                                .length -
                                                                1 && (
                                                            <span className="absolute left-[-14px] top-1/2 h-1/2 w-px bg-[#999] dark:bg-[#555]"></span>
                                                        )}
                                                        <span
                                                            className={`absolute left-[-14px] top-1/2 w-2 h-px bg-[#999] dark:bg-[#555] ${activeHLine}`}
                                                        ></span>
                                                        <SidebarMenuSubButton
                                                            className={`rounded-none data-[active=true]:bg-transparent data-[active=true]:font-semibold ${!isSubActive ? 'opacity-65 hover:opacity-100 transition-opacity duration-200' : ''}`}
                                                            isActive={
                                                                isSubActive
                                                            }
                                                            onClick={() =>
                                                                router.push(
                                                                    subItem.url
                                                                )
                                                            }
                                                        >
                                                            <span className="text-[14px]">
                                                                {subItem.title}
                                                            </span>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                );
                                            }
                                        )}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    </SidebarMenu>
                </SidebarGroup>
            )}
        </CollapsibleContext.Provider>
    );
}

function CollapsibleItem({
    item,
    path,
    allItems,
}: {
    item: {
        title: string;
        url: string;
        icon: React.ForwardRefExoticComponent<
            Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
        >;
        children?: {
            title: string;
            url: string;
        }[];
    };
    path: string;
    allItems: {
        title: string;
        url: string;
        icon: React.ForwardRefExoticComponent<
            Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
        >;
        children?: {
            title: string;
            url: string;
        }[];
    }[];
}) {
    const router = useRouter();
    const [hash, setHash] = useState('');
    const fullPath = path + hash;
    const { openItemId, setOpenItemId } = useContext(CollapsibleContext);

    const isOpen = openItemId === item.title;

    // Check if this item should be active, excluding paths claimed by more-specific sibling items
    const isItemActive = (() => {
        if (item.children) {
            // For items with children, check if path matches item URL or any child URL
            if (item.children.some(child => path.startsWith(child.url)))
                return true;
            // Parent-path prefix matching (e.g., /investment-calculators/profit-metrics/)
            if (item.children.some(child => {
                const parentPath = child.url.split('/').slice(0, -1).join('/');
                return parentPath && path.startsWith(parentPath + '/');
            })) return true;
            // Check if path starts with item.url but NOT with a more specific sibling's URL
            if (path.startsWith(item.url)) {
                const moreSpecificSibling = allItems.find(
                    other =>
                        other.title !== item.title &&
                        path.startsWith(other.url) &&
                        other.url.length > item.url.length
                );
                return !moreSpecificSibling;
            }
            return false;
        }
        return path.startsWith(item.url);
    })();

    useEffect(() => {
        function updateHash() {
            setHash(window.location.hash);
        }

        updateHash();
        window.addEventListener('hashchange', updateHash);
        window.addEventListener('popstate', updateHash);
        const interval = setInterval(updateHash, 100);

        return () => {
            window.removeEventListener('hashchange', updateHash);
            window.removeEventListener('popstate', updateHash);
            clearInterval(interval);
        };
    }, []);

    const handleClick = () => {
        if (item.children) {
            // If it has children, check if we're on the same path
            if (path.startsWith(item.url)) {
                // We're on the same path, toggle the collapsible
                if (isOpen) {
                    setOpenItemId(null);
                } else {
                    setOpenItemId(item.title);
                }
            } else {
                // We're on a different path, redirect first
                router.push(item.url);
                // Then open this item
                setOpenItemId(item.title);
            }
        } else {
            // No children, just redirect
            router.push(item.url);
        }
    };

    return (
        <Collapsible
            asChild
            open={isOpen}
            className='group/collapsible [&>button[data-slot="collapsible-trigger"]]:rounded-none [&>button[data-active=true]]:border-l-6 dark:[&>button[data-active=true]]:border-[var(--brand-color)] [&>button[data-active=true]]:border-brand-text [&>button[data-active=true]]:rounded-none [&>button]:cursor-pointer dark:[&>button[data-active=true]]:bg-[var(--brand-color)]/5'
        >
            <SidebarMenuItem className={'font-medium'}>
                {item.children ? (
                    <>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                                tooltip={
                                    <div className="flex flex-col gap-1 p-2">
                                        <div
                                            className="font-semibold mb-1.5 cursor-pointer dark:hover:text-[var(--brand-color)]"
                                            onClick={handleClick}
                                        >
                                            {item.title}
                                        </div>
                                        {item.children.map(subItem => (
                                            <div
                                                key={subItem.title}
                                                onClick={() =>
                                                    router.push(subItem.url)
                                                }
                                                className="dark:hover:text-[var(--brand-color)] text-[var(--brand-grey-foreground)] hover:text-brand-text cursor-pointer"
                                            >
                                                {subItem.title}
                                            </div>
                                        ))}
                                    </div>
                                }
                                isActive={isItemActive}
                                onClick={handleClick}
                                className={
                                    'text-[16px] data-[active=true]:font-semibold'
                                }
                            >
                                {item.icon && <item.icon className="size-4" />}
                                <span>{item.title}</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                            <SidebarMenuSub
                                style={{ borderLeft: 'none' }}
                                className="pl-5 ml-4.5 relative before:absolute before:left-1.5 before:top-0 before:bottom-3 before:w-px before:bg-[#999] dark:before:bg-[#555]"
                            >
                                {item.children.map((subItem, index) => {
                                    const isSubActive = (() => {
                                        // Exact match
                                        if (path === subItem.url || fullPath === subItem.url) return true;
                                        // Prefix match on parent path (e.g., /investment-calculators/profit-metrics/)
                                        // Extract parent path up to the group level
                                        const parentPath = subItem.url.split('/').slice(0, -1).join('/');
                                        if (parentPath && path.startsWith(parentPath + '/')) {
                                            // Check no sibling has a more specific match
                                            const moreSpecificSibling = item.children!.find(
                                                s => s.url !== subItem.url && (path === s.url || path.startsWith(s.url + '/'))
                                            );
                                            return !moreSpecificSibling;
                                        }
                                        return false;
                                    })();
                                    const activeLine = isSubActive
                                        ? '!bg-[var(--brand-text)] dark:!bg-[var(--brand-color)] !w-[1.5px]'
                                        : '';
                                    const activeHLine = isSubActive
                                        ? '!bg-[var(--brand-text)] dark:!bg-[var(--brand-color)] !h-[1.5px]'
                                        : '';
                                    return (
                                        <SidebarMenuSubItem
                                            key={subItem.title}
                                            className={
                                                'cursor-pointer relative'
                                            }
                                        >
                                            {/* Vertical stub */}
                                            <span
                                                className={`absolute left-[-14px] top-0 h-1/2 w-px bg-[#999] dark:bg-[#555] ${activeLine}`}
                                            ></span>
                                            {/* Continue vertical line down for non-last items */}
                                            {index !==
                                                item.children!.length - 1 && (
                                                <span className="absolute left-[-14px] top-1/2 h-1/2 w-px bg-[#999] dark:bg-[#555]"></span>
                                            )}
                                            {/* Horizontal connector */}
                                            <span
                                                className={`absolute left-[-14px] top-1/2 w-2 h-px bg-[#999] dark:bg-[#555] ${activeHLine}`}
                                            ></span>
                                            <SidebarMenuSubButton
                                                className={`rounded-none data-[active=true]:bg-transparent data-[active=true]:font-semibold ${!isSubActive ? 'opacity-65 hover:opacity-100 transition-opacity duration-200' : ''}`}
                                                isActive={isSubActive}
                                                onClick={() =>
                                                    router.push(subItem.url)
                                                }
                                            >
                                                <span className="text-[14px]">
                                                    {subItem.title}
                                                </span>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    );
                                })}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </>
                ) : (
                    <SidebarMenuButton
                        isActive={isItemActive}
                        onClick={() => router.push(item.url)}
                        tooltip={
                            <p className={'font-semibold'}>{item.title}</p>
                        }
                        className={
                            'text-[16px] data-[active=true]:font-semibold'
                        }
                    >
                        {item.icon && <item.icon className="size-4" />}
                        <span>{item.title}</span>
                    </SidebarMenuButton>
                )}
            </SidebarMenuItem>
        </Collapsible>
    );
}
