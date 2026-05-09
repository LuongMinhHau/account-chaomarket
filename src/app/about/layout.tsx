import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/get-server-locale';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getServerLocale();
    return {
        title: locale === 'vi' ? 'Giới Thiệu' : 'About',
        description: locale === 'vi'
            ? 'Tìm hiểu về Chào Market và sứ mệnh của chúng tôi.'
            : 'Learn about Chào Market and our mission.',
    };
}

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
