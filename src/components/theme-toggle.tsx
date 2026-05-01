'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenuButton, useSidebar } from './ui/sidebar';
import { useI18n } from '@/context/i18n/context';

const ThemeToggle = ({
    lightVisible = true,
    darkVisible = true,
}: {
    lightVisible?: boolean;
    darkVisible?: boolean;
}) => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);
    const { open: isCollapsed } = useSidebar();
    const { t } = useI18n();

    React.useEffect(() => {
        setMounted(true);
    }, []);

    // If only 1 theme visible → force that theme
    React.useEffect(() => {
        if (!mounted) return;
        if (lightVisible && !darkVisible && theme !== 'light') {
            setTheme('light');
        } else if (!lightVisible && darkVisible && theme !== 'dark') {
            setTheme('dark');
        }
    }, [lightVisible, darkVisible, theme, setTheme, mounted]);

    if (!mounted) return null;

    // If only 1 visible → don't render the switcher
    if (!lightVisible || !darkVisible) {
        return null;
    }

    const currentTheme =
        theme === 'light' || theme === 'dark' ? theme : 'light';
    const isCompact = !isCollapsed;

    if (isCompact) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                        className="dark:bg-transparent border-none dark:hover:text-[var(--brand-color)] transition-colors! duration-300 ease-in-out"
                        tooltip={<p className={'font-semibold'}>Themes</p>}
                    >
                        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    side="right"
                    className={'dark:bg-brand-dialog'}
                >
                    <DropdownMenuItem
                        onClick={() => setTheme('light')}
                        className={
                            'dark:hover:text-[var(--brand-color)]!' +
                            ' dark:[&:hover>svg]:text-[var(--brand-color)]! hover:bg-transparent! transition-all!' +
                            ' duration-200 ease-in-out cursor-pointer'
                        }
                    >
                        <Sun className="mr-2 h-4 w-4" /> {t('common.light')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setTheme('dark')}
                        className={
                            'dark:hover:text-[var(--brand-color)]!' +
                            ' dark:[&:hover>svg]:text-[var(--brand-color)]! hover:bg-transparent! transition-all!' +
                            ' duration-200 ease-in-out cursor-pointer'
                        }
                    >
                        <Moon className="mr-2 h-4 w-4" /> {t('common.dark')}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    // Render Tabs for wider screen or expanded sidebar
    return (
        <Tabs
            defaultValue={currentTheme}
            onValueChange={value => setTheme(value)}
            className="w-fit"
        >
            <TabsList className="flex gap-2 bg-transparent">
                <TabsTrigger
                    value="light"
                    className="text-[13px] data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-[rgba(0,0,0,0.9)] dark:data-[state=inactive]:hover:text-[rgba(255,255,255,0.9)] bg-transparent! data-[state=active]:text-[rgba(0,0,0,0.9)]! dark:data-[state=active]:text-[rgba(255,255,255,0.9)]! data-[state=active]:border-[rgba(0,0,0,0.15)]! dark:data-[state=active]:border-[rgba(255,255,255,0.2)]! data-[state=active]:bg-transparent! data-[state=active]:shadow-none! cursor-pointer transition-all! duration-300 ease-in-out"
                >
                    <Sun className="h-4 w-4" /> {t('common.light')}
                </TabsTrigger>
                <TabsTrigger
                    value="dark"
                    className="text-[13px] data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-[rgba(0,0,0,0.9)] dark:data-[state=inactive]:hover:text-[rgba(255,255,255,0.9)] bg-transparent! data-[state=active]:text-[rgba(0,0,0,0.9)]! dark:data-[state=active]:text-[rgba(255,255,255,0.9)]! data-[state=active]:border-[rgba(0,0,0,0.15)]! dark:data-[state=active]:border-[rgba(255,255,255,0.2)]! data-[state=active]:bg-transparent! data-[state=active]:shadow-none! cursor-pointer transition-all! duration-300 ease-in-out"
                >
                    <Moon className="h-4 w-4" /> {t('common.dark')}
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );
};

export default ThemeToggle;
