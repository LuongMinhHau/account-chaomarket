import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/get-server-locale';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getServerLocale();
    return {
        title: locale === 'vi' ? 'Chính Sách Bảo Mật' : 'Privacy Policy',
        description: locale === 'vi'
            ? 'Chính sách bảo mật của Chào Market.'
            : 'Chào Market privacy policy.',
    };
}

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
