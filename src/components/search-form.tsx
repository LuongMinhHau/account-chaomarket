'use client';

import { Search, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useI18n } from '@/context/i18n/context';
import { useRouter } from 'next/navigation';
import { searchContent, SearchableItem } from '@/constant/searchable-content';
import Image from 'next/image';
import { LogoBrand } from '@image/index';
import LogoChaoNews from '@/../public/img/chaonews-logo.svg';

const CATEGORY_LABELS: Record<string, Record<string, string>> = {
    en: {
        page: 'Pages',
        feature: 'Features',
        'market-data': 'Market Data',
        solution: 'Solutions',
        info: 'Information',
    },
    vi: {
        page: 'Trang',
        feature: 'Tính năng',
        'market-data': 'Dữ liệu thị trường',
        solution: 'Giải pháp',
        info: 'Thông tin',
    },
};

const SEARCH_TEXTS_DEFAULT = {
    en: {
        placeholder: 'Search',
        noResults: 'No results found',
    },
    vi: {
        placeholder: 'Tìm kiếm',
        noResults: 'Không tìm thấy kết quả',
    },
};

/* ── Ecosystem Apps Grid Icon (3×3) — matches Chào News ── */
function GridIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect x="1" y="1" width="6" height="6" rx="1" />
            <rect x="9" y="1" width="6" height="6" rx="1" />
            <rect x="17" y="1" width="6" height="6" rx="1" />
            <rect x="1" y="9" width="6" height="6" rx="1" />
            <rect x="9" y="9" width="6" height="6" rx="1" />
            <rect x="17" y="9" width="6" height="6" rx="1" />
            <rect x="1" y="17" width="6" height="6" rx="1" />
            <rect x="9" y="17" width="6" height="6" rx="1" />
            <rect x="17" y="17" width="6" height="6" rx="1" />
        </svg>
    );
}



/* ── Ecosystem Launcher Popover ── */
function EcosystemLauncher() {
    const [isOpen, setIsOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const { locale } = useI18n();

    const ECOSYSTEM_APPS = [
        {
            name: 'Chào Market',
            slogan: locale === 'vi' ? 'Quản Lý Rủi Ro Của Bạn' : 'Manage Your Risk',
            url: 'https://trading.chaomarket.com',
            icon: 'chaomarket' as const,
        },
        {
            name: 'Chào News',
            slogan: locale === 'vi' ? 'Quản Lý Tin Tức Của Bạn' : 'Manage Your News Feed',
            url: 'https://news.chaomarket.com',
            icon: 'chaonews' as const,
        },
    ];

    // Close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            if (
                popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
                btnRef.current && !btnRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen]);

    // Compute popover position
    const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
    useEffect(() => {
        if (!isOpen || !btnRef.current) return;
        const rect = btnRef.current.getBoundingClientRect();
        const popW = 280;
        const spaceRight = window.innerWidth - rect.right;

        if (spaceRight >= popW + 8) {
            setPos({ top: rect.top, left: rect.right + 4 });
        } else {
            setPos({ top: rect.bottom + 4, left: rect.right - popW });
        }
    }, [isOpen]);

    return (
        <>
            <button
                ref={btnRef}
                type="button"
                onClick={() => setIsOpen(o => !o)}
                className={`flex items-center justify-center size-6 rounded-[4px] mr-[1px] shrink-0 transition-colors duration-200 cursor-pointer
                    bg-[var(--brand-color)] text-black
                    ${isOpen
                        ? 'opacity-80'
                        : 'hover:opacity-80'
                    }`}
                aria-label={locale === 'vi' ? 'Ứng Dụng' : 'Apps'}
            >
                <GridIcon className="size-4" />
            </button>

            {isOpen && pos && (
                <div
                    ref={popoverRef}
                    className="fixed z-[500] min-w-[280px] p-3 rounded-[10px] shadow-xl animate-in fade-in-0 duration-150
                        bg-white border border-gray-200
                        dark:bg-[#333] dark:border-[#4a4a4a]"
                    style={{ top: pos.top, left: pos.left }}
                >
                    <p className="text-xs font-semibold tracking-[0.05em] mb-2
                        text-black/80 dark:text-white/80">
                        {locale === 'vi' ? 'Ứng Dụng' : 'Apps'}
                    </p>

                    <div className="grid grid-cols-2 gap-1.5">
                        {ECOSYSTEM_APPS.map(app => (
                            <a
                                key={app.name}
                                href={app.url}
                                target={app.url.startsWith('http') ? '_blank' : undefined}
                                rel={app.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2.5 p-2.5 rounded-lg border border-transparent transition-colors duration-200
                                    hover:border-black/30 dark:hover:border-white/30"
                            >
                                <div className="shrink-0 w-[35px] h-[35px] rounded-lg overflow-hidden">
                                    {app.icon === 'chaomarket' ? (
                                        <Image
                                            src={LogoBrand}
                                            alt="Chào Market"
                                            width={35}
                                            height={35}
                                            className="w-[35px] h-[35px] rounded-lg border border-border"
                                        />
                                    ) : (
                                        <Image
                                            src={LogoChaoNews}
                                            alt="Chào News"
                                            width={35}
                                            height={35}
                                            className="w-[35px] h-[35px] rounded-lg"
                                        />
                                    )}
                                </div>
                                <div className="flex flex-col min-w-0 gap-px">
                                    <span className={`text-sm font-semibold truncate text-black ${
                                        app.icon === 'chaomarket'
                                            ? 'dark:text-[#FFE400]'
                                            : 'dark:text-[#1a73e8]'
                                    }`}>
                                        {app.name}
                                    </span>
                                    <span className="text-xs font-semibold truncate
                                        text-black/90 dark:text-white/90">
                                        {app.slogan}
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

export function SearchForm({ ...props }: React.ComponentProps<'form'>) {
    const { open: isOpen, toggleSidebar } = useSidebar();
    const { t, locale } = useI18n();
    const router = useRouter();

    const defaults = SEARCH_TEXTS_DEFAULT[locale as keyof typeof SEARCH_TEXTS_DEFAULT] ?? SEARCH_TEXTS_DEFAULT.en;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawPlaceholder = t('search.placeholder' as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawNoResults = t('search.noResults' as any);
    const searchPlaceholder = rawPlaceholder && rawPlaceholder !== 'search.placeholder' ? rawPlaceholder : defaults.placeholder;
    const searchNoResults = rawNoResults && rawNoResults !== 'search.noResults' ? rawNoResults : defaults.noResults;
    const searchRef = useRef<HTMLDivElement>(null);
    const [query, setQuery] = useState('');
    const [pageResults, setPageResults] = useState<SearchableItem[]>([]);
    const [postResults, setPostResults] = useState<{ title: string; url: string }[]>([]);
    const [isResultsOpen, setIsResultsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isLoadingPosts, setIsLoadingPosts] = useState(false);

    // All results combined for keyboard navigation
    const allResults = useMemo(() => [...pageResults.map(p => p.url), ...postResults.map(p => p.url)], [pageResults, postResults]);

    // Instant page search
    useEffect(() => {
        if (query.length < 2) {
            setPageResults([]);
            setPostResults([]);
            setIsResultsOpen(false);
            return;
        }
        const menuResults = searchContent(query, t);
        setPageResults(menuResults);
        setIsResultsOpen(true);
        setSelectedIndex(-1);
    }, [query, t]);

    // No API post search on Account portal — local search only

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) setIsResultsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleResultClick = useCallback((url: string) => {
        router.push(url);
        setQuery(''); setPageResults([]); setPostResults([]); setIsResultsOpen(false);
    }, [router]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        const total = allResults.length;
        switch (e.key) {
            case 'ArrowDown':
                if (isResultsOpen && total > 0) { e.preventDefault(); setSelectedIndex(p => (p < total - 1 ? p + 1 : 0)); }
                break;
            case 'ArrowUp':
                if (isResultsOpen && total > 0) { e.preventDefault(); setSelectedIndex(p => (p > 0 ? p - 1 : total - 1)); }
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && allResults[selectedIndex]) handleResultClick(allResults[selectedIndex]);
                else if (total > 0) handleResultClick(allResults[0]);
                break;
            case 'Escape':
                setIsResultsOpen(false); setQuery('');
                break;
        }
    }, [isResultsOpen, allResults, selectedIndex, handleResultClick]);

    const hasAnyResults = pageResults.length > 0 || postResults.length > 0 || isLoadingPosts;
    const labels = locale === 'vi'
        ? { pages: 'Trang', posts: 'Bài viết', loading: 'Đang tìm bài viết...' }
        : { pages: 'Pages', posts: 'Posts', loading: 'Searching posts...' };

    if (!isOpen) {
        return (
            <SidebarGroup className="p-0!">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            onClick={toggleSidebar}
                            className="h-8 w-full justify-center"
                            aria-label="Open search"
                            tooltip={<p className={'font-semibold'}>Search</p>}
                        >
                            <Search />
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>
        );
    }

    return (
        <form {...props} onSubmit={e => e.preventDefault()}>
            <SidebarGroup className="p-0 dark:bg-sidebar relative">
                <SidebarGroupContent
                    ref={searchRef}
                    className="relative flex flex-col w-full"
                >
                    {/* Search Row: Search input + Ecosystem Launcher */}
                    <div className="flex items-center gap-[2px]">
                        {/* Search Input */}
                        <div className="flex-1 min-w-0 flex items-center text-[var(--brand-grey-foreground)] rounded-md hover:bg-black/5 dark:hover:bg-white/5 focus-within:bg-transparent transition-all! duration-300 ease-in-out [\&_input:focus-visible]:placeholder:font-semibold [\&_input:focus-visible~svg]:stroke-[2.5]">
                            {query ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setQuery('');
                                        setPageResults([]);
                                        setPostResults([]);
                                        setIsResultsOpen(false);
                                    }}
                                    className="flex-shrink-0 p-0.5 rounded-full hover:bg-[var(--brand-grey)] transition-colors duration-200 cursor-pointer"
                                    aria-label="Clear search"
                                >
                                    <X className="size-4 text-[var(--brand-grey-foreground)] hover:text-white" />
                                </button>
                            ) : (
                                <Search className="pointer-events-none size-4 shrink-0 select-none transition-all duration-300" />
                            )}
                            <Label htmlFor="search" className="sr-only">
                                {t('common.search')}
                            </Label>
                            <input
                                id="search"
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={() => query.length >= 2 && allResults.length > 0 && setIsResultsOpen(true)}
                                placeholder={searchPlaceholder}
                                className="pl-2 h-8 w-full border-none bg-transparent focus:outline-none focus-visible:ring-0 text-brand-text dark:placeholder:text-[var(--brand-grey-foreground)] placeholder:text-[var(--brand-grey-foreground)] placeholder:transition-all placeholder:duration-300"
                            />
                        </div>

                        {/* Ecosystem Launcher Button */}
                        <EcosystemLauncher />
                    </div>

                    {/* Search Results Dropdown — Two Sections */}


                    {isResultsOpen && hasAnyResults && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-sidebar border border-[var(--brand-grey)] rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                            {/* Section: Pages */}
                            {pageResults.length > 0 && (
                                <>
                                    <div className="px-3 pt-2 pb-1">
                                        <span className="text-xs font-semibold text-[var(--brand-grey-foreground)] uppercase tracking-wider">
                                            {labels.pages}
                                        </span>
                                    </div>
                                    {pageResults.map((item, index) => {
                                        const raw = item.titleKey ? t(item.titleKey) : '';
                                        const translatedTitle = (raw && raw !== item.titleKey) ? raw : item.title;
                                        return (
                                            <button
                                                key={item.url + index}
                                                type="button"
                                                onClick={() => handleResultClick(item.url)}
                                                className={`w-full text-left px-3 py-1.5 hover:bg-[var(--brand-grey)] transition-colors flex items-center justify-between gap-2 ${selectedIndex === index ? 'bg-[var(--brand-grey)]' : ''}`}
                                            >
                                                <span className="text-sm font-medium text-brand-text dark:text-white truncate">
                                                    {translatedTitle}
                                                </span>
                                                <span className="text-xs px-2 py-0.5 rounded bg-[var(--brand-grey)] text-[var(--brand-grey-foreground)] shrink-0">
                                                    {CATEGORY_LABELS[locale]?.[item.category] || item.category}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </>
                            )}

                            {/* Section: Posts */}
                            {(postResults.length > 0 || isLoadingPosts) && (
                                <>
                                    <div className={`px-3 pt-2 pb-1 ${pageResults.length > 0 ? 'border-t border-[var(--brand-grey)]' : ''}`}>
                                        <span className="text-xs font-semibold text-[var(--brand-grey-foreground)] uppercase tracking-wider">
                                            {labels.posts}
                                        </span>
                                    </div>
                                    {postResults.map((post, i) => {
                                        const globalIndex = pageResults.length + i;
                                        return (
                                            <button
                                                key={post.url + i}
                                                type="button"
                                                onClick={() => handleResultClick(post.url)}
                                                className={`w-full text-left px-3 py-1.5 hover:bg-[var(--brand-grey)] transition-colors flex items-center gap-2 ${selectedIndex === globalIndex ? 'bg-[var(--brand-grey)]' : ''}`}
                                            >
                                                <span className="text-sm font-medium text-brand-text dark:text-white truncate">
                                                    {post.title}
                                                </span>
                                            </button>
                                        );
                                    })}
                                    {isLoadingPosts && (
                                        <div className="px-3 py-2 text-xs text-[var(--brand-grey-foreground)] animate-pulse">
                                            {labels.loading}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* No results */}
                    {query.length >= 2 && !hasAnyResults && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-sidebar border border-[var(--brand-grey)] rounded-lg shadow-lg z-50 p-3">
                            <p className="text-sm text-[var(--brand-grey-foreground)] text-center">
                                {searchNoResults}
                            </p>
                        </div>
                    )}
                </SidebarGroupContent>
            </SidebarGroup>
        </form>
    );
}
