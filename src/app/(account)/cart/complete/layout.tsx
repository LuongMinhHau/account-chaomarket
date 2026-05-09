import type { Metadata } from 'next';
import { getServerLocale } from '@/lib/get-server-locale';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getServerLocale();
    return {
        title: locale === 'vi' ? 'Hoàn Tất Đơn Hàng' : 'Order Complete',
        description: locale === 'vi'
            ? 'Xác nhận trạng thái thanh toán đơn hàng của bạn.'
            : 'Confirm your order payment status.',
    };
}

export default function CartCompleteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
