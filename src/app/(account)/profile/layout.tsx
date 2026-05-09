import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/get-server-locale';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getServerLocale();
    return {
        title: locale === 'vi' ? 'Hồ Sơ' : 'Profile',
        description: locale === 'vi'
            ? 'Quản lý thông tin cá nhân tài khoản Chào Market.'
            : 'Manage your Chào Market account profile.',
    };
}

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
