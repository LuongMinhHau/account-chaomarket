'use client';
import React from 'react';
import { Globe, PhoneCall } from 'lucide-react';
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    useSidebar,
} from '@/components/ui/sidebar';
import ThemeToggle from './theme-toggle';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useI18n } from '@/context/i18n/context';
import Image from 'next/image';
import { ENLocale, VILocale } from '../../public/languages';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LanguageSwitcher = ({
    viVisible = true,
    enVisible = true,
}: {
    viVisible?: boolean;
    enVisible?: boolean;
}) => {
    const { locale, setLocale, forceLocale, getPreferredLocale } = useI18n();
    const { open } = useSidebar();

    // Handle visibility changes
    React.useEffect(() => {
        if (viVisible && enVisible) {
            // Both available — restore user's preferred locale if it differs from current
            const preferred = getPreferredLocale();
            if (
                preferred &&
                preferred !== locale &&
                (preferred === 'vi' || preferred === 'en')
            ) {
                forceLocale(preferred);
            }
        } else if (viVisible && !enVisible && locale !== 'vi') {
            // Only VI available — force to VI (preserve preference)
            forceLocale('vi');
        } else if (!viVisible && enVisible && locale !== 'en') {
            // Only EN available — force to EN (preserve preference)
            forceLocale('en');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viVisible, enVisible]);

    // If only 1 visible → don't render the switcher
    if (!viVisible || !enVisible) {
        return null;
    }

    if (!open) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                        className="dark:bg-transparent border-none dark:hover:text-[var(--brand-color)] transition-colors! duration-300 ease-in-out"
                        tooltip={<p className={'font-semibold'}>Languages</p>}
                    >
                        <Globe className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <Globe className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <span className="sr-only">Toggle Language</span>
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    side="right"
                    sideOffset={10}
                    className={'dark:bg-brand-dialog'}
                >
                    <DropdownMenuItem
                        onClick={() => setLocale('vi')}
                        className={
                            'dark:hover:text-[var(--brand-color)]!' +
                            ' dark:[&:hover>svg]:text-[var(--brand-color)]! hover:bg-transparent! transition-all!' +
                            ' duration-200 ease-in-out cursor-pointer'
                        }
                    >
                        <Image
                            src={VILocale}
                            alt={`locale-flag-vi`}
                            width={1920}
                            height={1080}
                            className={'size-4 object-contain'}
                        />{' '}
                        Tiếng Việt
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setLocale('en')}
                        className={
                            'dark:hover:text-[var(--brand-color)]!' +
                            ' dark:[&:hover>svg]:text-[var(--brand-color)]! hover:bg-transparent! transition-all!' +
                            ' duration-200 ease-in-out cursor-pointer'
                        }
                    >
                        <Image
                            src={ENLocale}
                            alt={`locale-flag-en`}
                            width={1920}
                            height={1080}
                            className={'size-4 object-contain'}
                        />{' '}
                        English
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    return (
        <Tabs
            defaultValue={locale}
            onValueChange={value => setLocale(value)}
            className="w-full"
        >
            <TabsList className="flex gap-2 bg-transparent">
                <TabsTrigger
                    value="vi"
                    className="text-[13px] data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-[rgba(0,0,0,0.9)] dark:data-[state=inactive]:hover:text-[rgba(255,255,255,0.9)] bg-transparent! data-[state=active]:text-[rgba(0,0,0,0.9)]! dark:data-[state=active]:text-[rgba(255,255,255,0.9)]! data-[state=active]:border-[rgba(0,0,0,0.15)]! dark:data-[state=active]:border-[rgba(255,255,255,0.2)]! data-[state=active]:bg-transparent! data-[state=active]:shadow-none! cursor-pointer transition-all! duration-300 ease-in-out"
                >
                    <Image
                        src={VILocale}
                        alt={`locale-flag-vi`}
                        width={1920}
                        height={1080}
                        className={'size-4 object-contain'}
                    />
                    Tiếng Việt
                </TabsTrigger>
                <TabsTrigger
                    value="en"
                    className="text-[13px] data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-[rgba(0,0,0,0.9)] dark:data-[state=inactive]:hover:text-[rgba(255,255,255,0.9)] bg-transparent! data-[state=active]:text-[rgba(0,0,0,0.9)]! dark:data-[state=active]:text-[rgba(255,255,255,0.9)]! data-[state=active]:border-[rgba(0,0,0,0.15)]! dark:data-[state=active]:border-[rgba(255,255,255,0.2)]! data-[state=active]:bg-transparent! data-[state=active]:shadow-none! cursor-pointer transition-all! duration-300 ease-in-out"
                >
                    <Image
                        src={ENLocale}
                        alt={`locale-flag-en`}
                        width={1920}
                        height={1080}
                        className={'size-4 object-contain'}
                    />
                    English
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );
};

const NavInformation = ({
    contactVisible = true,
    languageVisible = true,
    languageViVisible = true,
    languageEnVisible = true,
    themeVisible = true,
    themeLightVisible = true,
    themeDarkVisible = true,
}: {
    contactVisible?: boolean;
    languageVisible?: boolean;
    languageViVisible?: boolean;
    languageEnVisible?: boolean;
    themeVisible?: boolean;
    themeLightVisible?: boolean;
    themeDarkVisible?: boolean;
}) => {
    const { t } = useI18n();

    return (
        <SidebarGroup className="px-2 mb-2">
            <SidebarMenu>
                {contactVisible && (
                    <SidebarMenuItem className={'font-medium'}>
                        <SidebarMenuButton
                            isActive={false}
                            tooltip={<p className={'font-semibold'}>Contact</p>}
                            onClick={() => window.open('https://chaomarket.com/contact', '_blank')}
                            className="text-xs md:text-sm"
                        >
                            <PhoneCall className="mr-2 w-4 h-4" />
                            <span>{t('common.contacts')}</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                )}
                {languageVisible && (
                    <SidebarMenuItem>
                        <LanguageSwitcher
                            viVisible={languageViVisible}
                            enVisible={languageEnVisible}
                        />
                    </SidebarMenuItem>
                )}
                {themeVisible && (
                    <SidebarMenuItem>
                        <ThemeToggle
                            lightVisible={themeLightVisible}
                            darkVisible={themeDarkVisible}
                        />
                    </SidebarMenuItem>
                )}
            </SidebarMenu>
        </SidebarGroup>
    );
};

export default NavInformation;
