import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/get-server-locale';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getServerLocale();
    return {
        title: locale === 'vi' ? 'Đăng Ký Thành Công' : 'Registration Complete',
        description: locale === 'vi'
            ? 'Tài khoản Chào Market đã được tạo thành công.'
            : 'Your Chào Market account has been created successfully.',
    };
}

export default function SignUpSuccessLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
