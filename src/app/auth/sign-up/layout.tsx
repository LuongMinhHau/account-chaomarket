import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/get-server-locale';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getServerLocale();
    return {
        title: locale === 'vi' ? 'Đăng Ký' : 'Sign Up',
        description: locale === 'vi'
            ? 'Tạo tài khoản Chào Market để trải nghiệm các dịch vụ của chúng tôi.'
            : 'Create a Chào Market account to explore our services.',
    };
}

export default function SignUpLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
