import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/get-server-locale';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getServerLocale();
    return {
        title: locale === 'vi' ? 'Thông Báo' : 'Notifications',
        description: locale === 'vi'
            ? 'Xem thông báo và cập nhật từ Chào Market.'
            : 'View notifications and updates from Chào Market.',
    };
}

export default function NotificationsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
