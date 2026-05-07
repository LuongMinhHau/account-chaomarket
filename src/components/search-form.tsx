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
import LogoBrand from '@/../public/img/brand-logo.svg';
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

const SEARCH_TEXTS = {
    en: { placeholder: 'Search', noResults: 'No results found' },
    vi: { placeholder: 'Tìm kiếm', noResults: 'Không tìm thấy kết quả' },
};

/* ── Ecosystem Apps Grid Icon (3×3) ── */
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
            name: 'Chào Trading',
            slogan:
                locale === 'vi' ? 'Quản Lý Rủi Ro Của Bạn' : 'Manage Your Risk',
            url: 'https://finance.chaomarket.com',
            icon: 'chaomarket' as const,
            color: '#FFE400',
        },
        {
            name: 'Chào News',
            slogan:
                locale === 'vi'
                    ? 'Quản Lý Tin Tức Của Bạn'
                    : 'Manage Your News Feed',
            url: 'https://news.chaomarket.com',
            icon: 'chaonews' as const,
            color: '#1a73e8',
        },
        {
            name: 'Chào Account',
            slogan:
                locale === 'vi' ? 'Quản Lý Tài Khoản' : 'Account Management',
            url: 'https://account.chaomarket.com',
            icon: 'chaomarket' as const,
            color: '#b388ff',
        },
    ];

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(e.target as Node) &&
                btnRef.current &&
                !btnRef.current.contains(e.target as Node)
            )
                setIsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen]);

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
                    ${isOpen ? 'opacity-80' : 'hover:opacity-80'}`}
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
                    <p className="text-xs font-semibold tracking-[0.05em] mb-2 text-black/80 dark:text-white/80">
                        {locale === 'vi'
                            ? 'Hệ Sinh Thái Chào Market'
                            : 'Chào Market Ecosystem'}
                    </p>

                    <div className="grid grid-cols-2 gap-1.5">
                        {ECOSYSTEM_APPS.map(app => (
                            <a
                                key={app.name}
                                href={app.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-2.5 p-2.5 rounded-lg border border-transparent transition-colors duration-200
                                    hover:border-black/30 dark:hover:border-white/30"
                            >
                                <div className="shrink-0 w-[35px] h-[35px] rounded-lg overflow-hidden">
                                    {app.icon === 'chaonews' ? (
                                        <Image
                                            src={LogoChaoNews}
                                            alt={app.name}
                                            width={35}
                                            height={35}
                                            className="w-[35px] h-[35px] rounded-lg"
                                        />
                                    ) : (
                                        <Image
                                            src={LogoBrand}
                                            alt={app.name}
                                            width={35}
                                            height={35}
                                            className="w-[35px] h-[35px] rounded-lg border border-border"
                                        />
                                    )}
                                </div>
                                <div className="flex flex-col min-w-0 gap-px">
                                    <span
                                        className="text-sm font-semibold truncate text-black"
                                        style={{ color: undefined }}
                                        data-color={app.color}
                                    >
                                        <span
                                            className={`dark:text-[${app.color}]`}
                                        >
                                            {app.name}
                                        </span>
                                    </span>
                                    <span className="text-xs font-semibold truncate text-black/90 dark:text-white/90">
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

    const texts =
        SEARCH_TEXTS[locale as keyof typeof SEARCH_TEXTS] ?? SEARCH_TEXTS.en;
    const searchRef = useRef<HTMLDivElement>(null);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchableItem[]>([]);
    const [isResultsOpen, setIsResultsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const allUrls = useMemo(() => results.map(r => r.url), [results]);

    // Instant local search only (no API)
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            setIsResultsOpen(false);
            return;
        }
        const found = searchContent(query, t);
        setResults(found);
        setIsResultsOpen(true);
        setSelectedIndex(-1);
    }, [query, t]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(e.target as Node)
            )
                setIsResultsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleResultClick = useCallback(
        (url: string) => {
            router.push(url);
            setQuery('');
            setResults([]);
            setIsResultsOpen(false);
        },
        [router]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            const total = allUrls.length;
            switch (e.key) {
                case 'ArrowDown':
                    if (isResultsOpen && total > 0) {
                        e.preventDefault();
                        setSelectedIndex(p => (p < total - 1 ? p + 1 : 0));
                    }
                    break;
                case 'ArrowUp':
                    if (isResultsOpen && total > 0) {
                        e.preventDefault();
                        setSelectedIndex(p => (p > 0 ? p - 1 : total - 1));
                    }
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (selectedIndex >= 0 && allUrls[selectedIndex])
                        handleResultClick(allUrls[selectedIndex]);
                    else if (total > 0) handleResultClick(allUrls[0]);
                    break;
                case 'Escape':
                    setIsResultsOpen(false);
                    setQuery('');
                    break;
            }
        },
        [isResultsOpen, allUrls, selectedIndex, handleResultClick]
    );

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
                    {/* Search Row */}
                    <div className="flex items-center gap-1.5">
                        {/* Search Input Container — visible border + background */}
                        <div
                            className="flex-1 min-w-0 flex items-center gap-1.5 px-2
                            border border-black/10 dark:border-white/10 rounded-md
                            bg-black/[0.03] dark:bg-white/[0.04]
                            hover:border-black/20 dark:hover:border-white/20
                            focus-within:border-black/20 dark:focus-within:border-white/20
                            transition-all duration-200"
                        >
                            {query ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setQuery('');
                                        setResults([]);
                                        setIsResultsOpen(false);
                                    }}
                                    className="flex-shrink-0 p-0.5 rounded-full hover:bg-[var(--brand-grey)] transition-colors duration-200 cursor-pointer"
                                    aria-label="Clear search"
                                >
                                    <X className="size-4 text-[var(--brand-grey-foreground)] hover:text-white" />
                                </button>
                            ) : (
                                <Search className="pointer-events-none size-4 shrink-0 select-none opacity-50 transition-all duration-200" />
                            )}
                            <Label htmlFor="search" className="sr-only">
                                Search
                            </Label>
                            <input
                                id="search"
                                type="text"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={() =>
                                    query.length >= 2 &&
                                    results.length > 0 &&
                                    setIsResultsOpen(true)
                                }
                                placeholder={texts.placeholder}
                                className="h-7 w-full border-none bg-transparent focus:outline-none focus-visible:ring-0
                                    text-sm text-brand-text
                                    placeholder:text-[var(--brand-grey-foreground)]/60
                                    placeholder:text-sm"
                            />
                        </div>

                        {/* Ecosystem Launcher — visually grouped */}
                        <EcosystemLauncher />
                    </div>

                    {/* Results */}
                    {isResultsOpen && results.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-sidebar border border-[var(--brand-grey)] rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                            {results.map((item, index) => (
                                <button
                                    key={item.url + index}
                                    type="button"
                                    onClick={() => handleResultClick(item.url)}
                                    className={`w-full text-left px-3 py-1.5 hover:bg-[var(--brand-grey)] transition-colors flex items-center justify-between gap-2 ${selectedIndex === index ? 'bg-[var(--brand-grey)]' : ''}`}
                                >
                                    <span className="text-sm font-medium text-brand-text dark:text-white truncate">
                                        {item.title}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 rounded bg-[var(--brand-grey)] text-[var(--brand-grey-foreground)] shrink-0">
                                        {CATEGORY_LABELS[locale]?.[
                                            item.category
                                        ] || item.category}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* No results */}
                    {query.length >= 2 && results.length === 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-sidebar border border-[var(--brand-grey)] rounded-lg shadow-lg z-50 p-3">
                            <p className="text-sm text-[var(--brand-grey-foreground)] text-center">
                                {texts.noResults}
                            </p>
                        </div>
                    )}
                </SidebarGroupContent>
            </SidebarGroup>
        </form>
    );
}
