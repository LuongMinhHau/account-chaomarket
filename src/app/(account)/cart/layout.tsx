import { Metadata } from 'next';
import { getServerLocale } from '@/lib/get-server-locale';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getServerLocale();
    const title = locale === 'vi' ? 'Giỏ Hàng' : 'Cart';
    const description = locale === 'vi'
        ? 'Xem lại sản phẩm đã chọn và hoàn tất thanh toán tại Chào Market.'
        : 'Review your selected products and complete checkout at Chào Market.';

    return {
        title,
        description,
        openGraph: { title: `${title} | Chào Market` },
    };
}

export default function CartLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
