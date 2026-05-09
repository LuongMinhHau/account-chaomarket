import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/get-server-locale';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getServerLocale();
    return {
        title: locale === 'vi' ? 'Đăng Nhập' : 'Sign In',
        description: locale === 'vi'
            ? 'Đăng nhập vào tài khoản Chào Market của bạn.'
            : 'Sign in to your Chào Market account.',
    };
}

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
