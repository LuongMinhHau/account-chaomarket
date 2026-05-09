import type { Metadata } from 'next';
import ForceTheme from './force-theme';
import { getServerLocale } from '@/lib/get-server-locale';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getServerLocale();
    const title = locale === 'vi' ? 'Thanh Toán Đơn Hàng' : 'Order Payment';
    const description = locale === 'vi'
        ? 'Hoàn tất thanh toán đơn hàng của bạn tại Chào Market.'
        : 'Complete your order payment at Chào Market.';

    return {
        title,
        description,
        robots: {
            index: false,
            follow: false,
        },
    };
}

export default function PurchaseLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="flex flex-col w-full max-w-svw text-sm md:text-[0.9375rem] lg:text-base bg-background/90 dark:bg-background">
            <ForceTheme />
            <div id="main-content" className="min-h-svh flex items-center justify-center px-4 md:px-[30px]">
                <main className="w-full max-w-3xl py-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
