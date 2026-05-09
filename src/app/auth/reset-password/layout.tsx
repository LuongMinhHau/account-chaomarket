import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/get-server-locale';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getServerLocale();
    return {
        title: locale === 'vi' ? 'Đặt Lại Mật Khẩu' : 'Reset Password',
        description: locale === 'vi'
            ? 'Đặt lại mật khẩu tài khoản Chào Market của bạn.'
            : 'Reset your Chào Market account password.',
    };
}

export default function ResetPasswordLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
