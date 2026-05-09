import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/get-server-locale';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getServerLocale();
    return {
        title: locale === 'vi' ? 'Bảo Mật' : 'Security',
        description: locale === 'vi'
            ? 'Quản lý bảo mật tài khoản, mật khẩu và xác thực hai yếu tố.'
            : 'Manage account security, password and two-factor authentication.',
    };
}

export default function SecurityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
