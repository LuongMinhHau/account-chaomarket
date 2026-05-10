import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import ForceTheme from './force-theme';
import { getServerLocale } from '@/lib/get-server-locale';
import ContactButtonServer from '@/components/app-contacts-server';
import AuthToolbar from '@/app/auth/components/auth-toolbar';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getServerLocale();
    const title = locale === 'vi' ? 'Đăng Ký Tư Vấn' : 'Book Consultation';
    const description = locale === 'vi'
        ? 'Đăng ký tư vấn với đội ngũ Chào Market.'
        : 'Book a consultation with the Chào Market team.';

    return {
        title,
        description,
        icons: { icon: '/img/brand-logo.svg' },
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default async function ConsultationLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const locale = await getServerLocale();

    return (
        <div className="flex flex-col w-full max-w-svw text-sm md:text-[0.9375rem] lg:text-base bg-background/90 dark:bg-background">
            <ForceTheme />
            {/* Brand — top-left, Chào Market logo */}
            <Link href="/" className="fixed top-4 left-4 md:top-6 md:left-8 z-50 flex items-center gap-2 group">
                <div className="shrink-0 transition-transform duration-300 group-hover:scale-105">
                    <Image
                        width={40}
                        height={40}
                        src="/img/brand-logo.svg"
                        alt="Chào Market"
                        className="size-[40px] rounded-lg border border-border"
                    />
                </div>
                <div className="hidden md:flex flex-col min-w-0">
                    <span className="truncate text-lg font-semibold leading-[1.2] text-black dark:text-[var(--brand-color)]">
                        Chào Market
                    </span>
                    <span className="truncate text-sm font-semibold leading-[1.3] text-black/90 dark:text-white/90">
                        {locale === 'vi' ? 'Trao Giá Trị Đến Bạn' : 'Delivering Value To You'}
                    </span>
                </div>
            </Link>
            <div id="main-content" className="min-h-svh flex items-center justify-center px-4 md:px-[30px]">
                <main className="w-full max-w-4xl py-10">
                    {children}
                </main>
            </div>
            <ContactButtonServer />
            <AuthToolbar />
        </div>
    );
}
