'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Shield, Settings, ShoppingBag, Info, Star, Filter, ChevronDown, MailOpen, MailCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/loading-spinner';
import PageHeader from '@/components/page-header';
import EmptyState from '@/components/empty-state';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/context/i18n/context';
import { usePageTitle } from '@/hooks/use-page-title';

interface NotificationItem {
    id: string;
    type: 'security' | 'system' | 'account' | 'order';
    title: string;
    message: string;
    isRead: boolean;
    isStarred: boolean;
    createdAt: string;
}

function useTypeConfig() {
    const { t } = useI18n();
    return {
        security: { label: t('notifications.type.security'), icon: <Shield className="w-4 h-4" /> },
        system: { label: t('notifications.type.system'), icon: <Settings className="w-4 h-4" /> },
        account: { label: t('notifications.type.account'), icon: <Info className="w-4 h-4" /> },
        order: { label: t('notifications.type.order'), icon: <ShoppingBag className="w-4 h-4" /> },
    } as const;
}

function useTimeAgo() {
    return (dateStr: string): string => {
        const d = new Date(dateStr);
        const dd = String(d.getDate()).padStart(2, '0');
        const MM = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}/${MM}/${yyyy}`;
    };
}

// ── Notification Row ──
function NotificationRow({
    notification,
    unread,
    onClickRow,
    onToggleStar,
    typeConfig,
    timeAgo,
}: {
    notification: NotificationItem;
    unread: boolean;
    onClickRow: () => void;
    onToggleStar: (e: React.MouseEvent) => void;
    typeConfig: ReturnType<typeof useTypeConfig>;
    timeAgo: (dateStr: string) => string;
}) {
    const cfg = typeConfig[notification.type] || typeConfig.system;

    return (
        <div
            className={cn(
                'group flex items-center gap-3 px-3 py-2.5',
                'border-b border-border/30 dark:border-white/[0.06]',
                'transition-colors duration-100',
                'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
                unread
                    ? 'bg-white dark:bg-white/[0.03]'
                    : 'bg-transparent',
            )}
        >
            {/* Star toggle */}
            <button
                onClick={onToggleStar}
                className={cn(
                    'flex-shrink-0 p-0.5 rounded transition-colors duration-150 cursor-pointer',
                    notification.isStarred
                        ? 'text-amber-400 hover:text-amber-500'
                        : 'text-black/20 dark:text-white/20 hover:text-amber-400',
                )}
                aria-label={notification.isStarred ? 'Unstar' : 'Star'}
            >
                <Star
                    className="size-[16px]"
                    fill={notification.isStarred ? 'currentColor' : 'none'}
                    strokeWidth={2}
                />
            </button>

            {/* Row content */}
            <div
                onClick={onClickRow}
                className="grid flex-1 min-w-0 cursor-pointer items-center"
                style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 4fr) minmax(0, 1fr) minmax(0, 1.2fr)', gap: '0 16px' }}
            >
                <span className={cn(
                    'text-[14px] min-w-0 truncate font-semibold',
                    unread ? 'text-black/90 dark:text-white/90' : 'text-black/50 dark:text-white/50'
                )}>
                    {notification.title}
                </span>
                <span className={cn(
                    'text-[14px] min-w-0 truncate font-normal',
                    unread ? 'text-black/60 dark:text-white/60' : 'text-black/40 dark:text-white/40'
                )}>
                    {notification.message}
                </span>
                <span className={cn(
                    'text-[14px] font-medium whitespace-nowrap',
                    unread ? 'text-black/90 dark:text-white/90' : 'text-black/50 dark:text-white/50'
                )}>
                    {cfg.label}
                </span>
                <span className={cn(
                    'text-[14px] whitespace-nowrap font-normal',
                    unread ? 'text-black/50 dark:text-white/50' : 'text-black/40 dark:text-white/40'
                )}>
                    {timeAgo(notification.createdAt)}
                </span>
            </div>
        </div>
    );
}

// ── Notification Card (Mobile) ──
function NotificationCard({
    notification,
    unread,
    onClickRow,
    onToggleStar,
    typeConfig,
    timeAgo,
}: {
    notification: NotificationItem;
    unread: boolean;
    onClickRow: () => void;
    onToggleStar: (e: React.MouseEvent) => void;
    typeConfig: ReturnType<typeof useTypeConfig>;
    timeAgo: (dateStr: string) => string;
}) {
    const cfg = typeConfig[notification.type] || typeConfig.system;

    return (
        <div
            onClick={onClickRow}
            className={cn(
                'px-3 py-3 cursor-pointer',
                'border-b border-border/30 dark:border-white/[0.06]',
                'transition-colors duration-100',
                'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
                unread
                    ? 'bg-white dark:bg-white/[0.03]'
                    : 'bg-transparent',
            )}
        >
            <div className="flex items-start justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <button
                        onClick={onToggleStar}
                        className={cn(
                            'flex-shrink-0 p-0.5 rounded transition-colors duration-150 cursor-pointer',
                            notification.isStarred
                                ? 'text-amber-400 hover:text-amber-500'
                                : 'text-black/20 dark:text-white/20 hover:text-amber-400',
                        )}
                        aria-label={notification.isStarred ? 'Unstar' : 'Star'}
                    >
                        <Star
                            className="size-[14px]"
                            fill={notification.isStarred ? 'currentColor' : 'none'}
                            strokeWidth={2}
                        />
                    </button>
                    <span className={cn(
                        'text-[14px] font-semibold truncate',
                        unread ? 'text-black/90 dark:text-white/90' : 'text-black/50 dark:text-white/50'
                    )}>
                        {notification.title}
                    </span>
                </div>
                <span className={cn(
                    'text-[12px] font-medium whitespace-nowrap ml-2 flex-shrink-0',
                    unread ? 'text-black/90 dark:text-white/90' : 'text-black/50 dark:text-white/50'
                )}>
                    {cfg.label}
                </span>
            </div>
            <p className={cn(
                'text-[13px] line-clamp-2 mb-1.5',
                unread ? 'text-black/60 dark:text-white/60' : 'text-black/40 dark:text-white/40'
            )}>
                {notification.message}
            </p>
            <span className={cn(
                'text-[12px]',
                unread ? 'text-black/40 dark:text-white/40' : 'text-black/30 dark:text-white/30'
            )}>
                {timeAgo(notification.createdAt)}
            </span>
        </div>
    );
}

// ── Mock data generator (outside component to avoid recreation) ──
function generateMockNotifications(): NotificationItem[] {
    const types: NotificationItem['type'][] = ['security', 'system', 'account', 'order'];
    const templates: Record<NotificationItem['type'], { title: string; message: string }[]> = {
        security: [
            { title: 'Đăng nhập mới phát hiện', message: 'Thiết bị Chrome trên macOS vừa đăng nhập vào tài khoản của bạn lúc 16:30 ngày 30/04/2026 từ Hồ Chí Minh, Việt Nam.' },
            { title: 'Mật khẩu đã được thay đổi', message: 'Mật khẩu tài khoản đã được cập nhật thành công. Nếu bạn không thực hiện thay đổi này, hãy đổi lại mật khẩu ngay.' },
            { title: 'Xác minh hai bước đã bật', message: 'Bảo mật hai lớp (2FA) đã được kích hoạt cho tài khoản của bạn. Mã xác minh sẽ được yêu cầu khi đăng nhập.' },
            { title: 'Phiên đăng nhập bất thường', message: 'Phát hiện đăng nhập từ thiết bị lạ tại Hà Nội, Việt Nam lúc 03:42. Nếu không phải bạn, hãy khóa tài khoản ngay.' },
            { title: 'Thiết bị mới được tin cậy', message: 'iPhone 15 Pro Max đã được thêm vào danh sách thiết bị tin cậy của bạn.' },
            { title: 'Đăng nhập từ vị trí mới', message: 'Tài khoản vừa đăng nhập từ Đà Nẵng, Việt Nam – thiết bị Firefox trên Windows 11.' },
            { title: 'Cảnh báo đăng nhập thất bại', message: 'Có 5 lần đăng nhập thất bại liên tiếp vào tài khoản của bạn từ IP 103.45.67.89. Tài khoản tạm khóa 15 phút.' },
            { title: 'Email khôi phục đã thay đổi', message: 'Email khôi phục tài khoản đã được cập nhật thành user_backup@gmail.com. Nếu bạn không thay đổi, liên hệ hỗ trợ.' },
            { title: 'Mã OTP đăng nhập', message: 'Mã xác minh đăng nhập của bạn là 847291. Mã có hiệu lực trong 5 phút. Không chia sẻ mã này với ai.' },
            { title: 'Phiên đăng nhập đã hết hạn', message: 'Phiên đăng nhập trên Safari – macOS đã hết hạn. Vui lòng đăng nhập lại để tiếp tục sử dụng.' },
        ],
        system: [
            { title: 'Bảo trì hệ thống', message: 'Hệ thống sẽ bảo trì vào lúc 02:00 - 04:00 ngày 01/05/2026. Các dịch vụ có thể bị gián đoạn trong thời gian này.' },
            { title: 'Cập nhật phiên bản mới', message: 'Phiên bản 2.5.0 đã được triển khai với nhiều cải tiến hiệu năng và giao diện người dùng mới.' },
            { title: 'Chính sách bảo mật cập nhật', message: 'Chính sách bảo mật đã được cập nhật từ ngày 01/05/2026. Vui lòng đọc và xác nhận để tiếp tục sử dụng dịch vụ.' },
            { title: 'Tính năng mới: Ví điện tử', message: 'Tính năng Ví điện tử vừa ra mắt. Nạp tiền ngay để nhận ưu đãi 10% cho giao dịch đầu tiên.' },
            { title: 'Thời gian hoạt động tháng 4', message: 'Uptime hệ thống tháng 4/2026 đạt 99.97%. Chi tiết báo cáo có tại trang Trạng thái Hệ thống.' },
            { title: 'Thay đổi Điều khoản sử dụng', message: 'Điều khoản sử dụng dịch vụ đã cập nhật hiệu lực từ 15/05/2026. Xem chi tiết trong Cài đặt.' },
            { title: 'Hệ thống đã khôi phục', message: 'Sự cố gián đoạn dịch vụ lúc 14:20 ngày 29/04/2026 đã được khắc phục. Xin lỗi vì sự bất tiện.' },
            { title: 'Cập nhật giao diện mới', message: 'Trang quản lý tài khoản đã được thiết kế lại với giao diện hiện đại hơn. Khám phá ngay!' },
            { title: 'Bảo trì máy chủ thanh toán', message: 'Máy chủ thanh toán sẽ bảo trì từ 00:00 - 02:00 ngày 03/05/2026. Vui lòng hoàn tất giao dịch trước thời gian này.' },
            { title: 'Khảo sát trải nghiệm người dùng', message: 'Hãy giúp chúng tôi cải thiện dịch vụ bằng cách tham gia khảo sát 2 phút. Bạn sẽ nhận voucher 50K sau khi hoàn thành.' },
        ],
        account: [
            { title: 'Cập nhật hồ sơ thành công', message: 'Thông tin cá nhân của bạn đã được cập nhật thành công. Nếu bạn không thực hiện thay đổi này, hãy liên hệ bộ phận hỗ trợ.' },
            { title: 'Ảnh đại diện đã thay đổi', message: 'Ảnh đại diện tài khoản đã được cập nhật thành công lúc 14:05 ngày 30/04/2026.' },
            { title: 'Xác minh email thành công', message: 'Email luongminhhau@gmail.com đã được xác minh thành công. Bạn đã có thể sử dụng đầy đủ các tính năng.' },
            { title: 'Nâng cấp tài khoản Premium', message: 'Chúc mừng! Tài khoản đã được nâng cấp lên Premium. Tận hưởng các ưu đãi độc quyền ngay từ bây giờ.' },
            { title: 'Số điện thoại đã cập nhật', message: 'Số điện thoại liên hệ đã được thay đổi thành 0901***456. Nếu bạn không yêu cầu, hãy liên hệ ngay.' },
            { title: 'Gói Premium sắp hết hạn', message: 'Gói Premium của bạn sẽ hết hạn vào ngày 15/05/2026. Gia hạn ngay để không bị gián đoạn dịch vụ.' },
            { title: 'Địa chỉ giao hàng đã thêm', message: 'Địa chỉ mới "123 Nguyễn Huệ, Q.1, TP.HCM" đã được thêm vào danh sách địa chỉ giao hàng của bạn.' },
            { title: 'Liên kết Google thành công', message: 'Tài khoản Google minhhau@gmail.com đã được liên kết thành công. Bạn có thể đăng nhập bằng Google.' },
            { title: 'Xóa tài khoản đã hủy', message: 'Yêu cầu xóa tài khoản đã được hủy thành công. Tài khoản của bạn vẫn hoạt động bình thường.' },
            { title: 'Ngôn ngữ đã thay đổi', message: 'Ngôn ngữ hiển thị đã được chuyển sang Tiếng Việt. Thay đổi sẽ áp dụng cho tất cả các trang.' },
        ],
        order: [
            { title: 'Đơn hàng #CM-20260430 đã xác nhận', message: 'Đơn hàng thuê xe của bạn đã được xác nhận thành công. Vui lòng kiểm tra chi tiết trong mục Lịch Sử Đơn Hàng.' },
            { title: 'Thanh toán thành công', message: 'Giao dịch 500.000 VNĐ cho gói đăng ký Premium đã được xử lý thành công. Hóa đơn điện tử đã gửi về email của bạn.' },
            { title: 'Đơn hàng #CM-20260428 đang giao', message: 'Đơn hàng của bạn đang được giao. Dự kiến nhận hàng vào 17:00 ngày 29/04/2026. Theo dõi tại mục Đơn hàng.' },
            { title: 'Hoàn tiền thành công', message: 'Yêu cầu hoàn tiền 350.000 VNĐ cho đơn #CM-20260425 đã xử lý. Số tiền sẽ về tài khoản trong 3-5 ngày.' },
            { title: 'Đơn hàng #CM-20260427 đã hoàn tất', message: 'Đơn hàng thuê xe Toyota Camry ngày 27/04/2026 đã hoàn tất. Cảm ơn bạn đã sử dụng dịch vụ!' },
            { title: 'Đánh giá đơn hàng', message: 'Hãy đánh giá trải nghiệm thuê xe Honda City ngày 26/04/2026 để nhận 50 điểm thưởng.' },
            { title: 'Đơn hàng #CM-20260501 mới tạo', message: 'Đơn hàng thuê xe Mercedes C200 từ ngày 01/05 đến 03/05/2026 đã được tạo. Chờ xác nhận từ chủ xe.' },
            { title: 'Gia hạn thuê xe thành công', message: 'Đơn thuê xe #CM-20260429 đã gia hạn thêm 2 ngày. Tổng chi phí bổ sung: 1.200.000 VNĐ.' },
            { title: 'Hủy đơn hàng thành công', message: 'Đơn hàng #CM-20260426 đã được hủy thành công. Tiền đặt cọc 200.000 VNĐ sẽ hoàn lại trong 24 giờ.' },
            { title: 'Nhận xe thành công', message: 'Bạn đã nhận xe Kia Morning biển số 51A-12345 thành công. Chúc bạn có chuyến đi vui vẻ!' },
        ],
    };

    const items: NotificationItem[] = [];
    for (let i = 0; i < 100; i++) {
        const type = types[i % 4];
        const templateList = templates[type];
        const tmpl = templateList[i % templateList.length];

        let timeOffset: number;
        if (i < 3) timeOffset = (i + 1) * 3 * 60000;
        else if (i < 8) timeOffset = (i - 1) * 45 * 60000;
        else if (i < 20) timeOffset = (i - 6) * 3 * 3600000;
        else if (i < 50) timeOffset = (i - 15) * 12 * 3600000;
        else timeOffset = (i - 40) * 18 * 3600000;

        items.push({
            id: `mock-${i + 1}`,
            type,
            title: tmpl.title,
            message: tmpl.message,
            isRead: i >= 15,
            isStarred: i % 7 === 0 || i % 13 === 0,
            createdAt: new Date(Date.now() - timeOffset).toISOString(),
        });
    }
    return items;
}

export default function NotificationsPage() {
    const { status } = useSession();
    const router = useRouter();
    const { t } = useI18n();
    usePageTitle('account.notification');
    const typeConfig = useTypeConfig();
    const timeAgo = useTimeAgo();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewingNotification, setViewingNotification] = useState<NotificationItem | null>(null);
    const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'starred' | 'security' | 'system' | 'account' | 'order'>('all');
    const originalReadState = useRef<Record<string, boolean>>({});
    const ITEMS_PER_PAGE = 15;
    const [showUnread, setShowUnread] = useState(ITEMS_PER_PAGE);
    const [showRead, setShowRead] = useState(ITEMS_PER_PAGE);

    // ── Mock data: 100 notifications for UI testing (memoized) ──
    const mockNotifications = useRef<NotificationItem[]>(generateMockNotifications()).current;

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?callbackUrl=/notifications');
            return;
        }
        if (status === 'authenticated') {
            fetchNotifications();
        }
    }, [status]);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/account/notifications');
            if (res.ok) {
                const data = await res.json();
                const items = data.notifications || [];
                setNotifications(items.length > 0 ? items : mockNotifications);
            } else {
                setNotifications(mockNotifications);
            }
        } catch {
            setNotifications(mockNotifications);
        } finally {
            setLoading(false);
        }
    };

    const isVisuallyUnread = (n: NotificationItem) =>
        n.id in originalReadState.current
            ? !originalReadState.current[n.id]
            : !n.isRead;

    const handleClick = useCallback((n: NotificationItem) => {
        originalReadState.current[n.id] = true;
        // Optimistic UI update — mark as read immediately
        setNotifications(prev =>
            prev.map(item =>
                item.id === n.id ? { ...item, isRead: true } : item
            )
        );
        if (!n.isRead) {
            fetch('/api/account/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: [n.id] }),
            });
        }
        setViewingNotification(n);
    }, []);

    const handleToggleStar = useCallback((n: NotificationItem, e: React.MouseEvent) => {
        e.stopPropagation();
        const newStarred = !n.isStarred;

        // Optimistic update
        setNotifications(prev =>
            prev.map(item =>
                item.id === n.id ? { ...item, isStarred: newStarred } : item
            )
        );

        // API call
        fetch('/api/account/notifications', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                toggleStar: true,
                notificationId: n.id,
                isStarred: newStarred,
            }),
        });
    }, []);

    // Apply filter
    const filtered = filter === 'all'
        ? notifications
        : filter === 'unread'
            ? notifications.filter(n => isVisuallyUnread(n))
            : filter === 'read'
                ? notifications.filter(n => !isVisuallyUnread(n))
                : filter === 'starred'
                    ? notifications.filter(n => n.isStarred)
                    : notifications.filter(n => n.type === filter);

    const unreadList = filtered.filter(n => isVisuallyUnread(n));
    const readList = filtered.filter(n => !isVisuallyUnread(n));

    type FilterKey = typeof filter;
    const filterOptions: { key: FilterKey; label: string; icon: React.ReactNode }[] = [
        { key: 'all', label: t('notifications.filter.all'), icon: <Filter className="size-3.5 text-current" /> },
        { key: 'unread', label: t('notifications.unread'), icon: <MailOpen className="size-3.5 text-current" /> },
        { key: 'read', label: t('notifications.read'), icon: <MailCheck className="size-3.5 text-current" /> },
        { key: 'starred', label: t('notifications.filter.starred'), icon: <Star className="size-3.5 text-current" /> },
        { key: 'security', label: t('notifications.type.security'), icon: <Shield className="size-3.5 text-current" /> },
        { key: 'system', label: t('notifications.type.system'), icon: <Settings className="size-3.5 text-current" /> },
        { key: 'account', label: t('notifications.type.account'), icon: <Info className="size-3.5 text-current" /> },
        { key: 'order', label: t('notifications.type.order'), icon: <ShoppingBag className="size-3.5 text-current" /> },
    ];

    if (loading || status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="w-full h-full mx-auto space-y-4">
            <PageHeader
                title={t('account.notification')}
                description={t('account.dashboard.notificationDesc')}
            />

            <div className="flex items-center justify-between">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className={cn(
                                'group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[14px] font-semibold cursor-pointer',
                                'border border-black/15 dark:border-white/15',
                                'bg-transparent',
                                'focus:outline-none',
                                'transition-all duration-300 ease-in-out',
                                filter === 'all'
                                    ? 'text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white'
                                    : 'text-black dark:text-white',
                            )}
                        >
                            {filterOptions.find(o => o.key === filter)?.label}
                            <ChevronDown className={cn(
                                'size-3 transition-transform duration-200 text-current',
                                'group-data-[state=open]:rotate-180',
                            )} />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        className="min-w-[160px] bg-brand-dropdown border-black/10 dark:border-white/10"
                    >
                        {filterOptions.map(opt => (
                            <DropdownMenuItem
                                key={opt.key}
                                onClick={() => { setFilter(opt.key); setShowUnread(ITEMS_PER_PAGE); setShowRead(ITEMS_PER_PAGE); }}
                                className={cn(
                                    'text-[13px] cursor-pointer gap-2',
                                    'hover:bg-transparent! focus:bg-transparent!',
                                    'transition-colors! duration-200 ease-in-out',
                                    filter === opt.key
                                        ? 'font-semibold text-black dark:text-white'
                                        : 'font-normal text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white',
                                )}
                            >
                                {opt.icon}
                                {opt.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <span className="text-[14px] text-black/80 dark:text-white/80">
                    {filtered.length} {t('account.notification').toLowerCase()}
                </span>
            </div>

            <Card className="page-card overflow-hidden">
                <CardContent className="p-0">
                    {/* Table Header (Desktop only) */}
                    <div className="hidden md:flex items-center gap-3 px-3 py-2.5 border-b border-border/40 dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02]">
                        <div className="flex-shrink-0" style={{ width: '20px' }} />
                        <div
                            className="grid flex-1 min-w-0 items-center"
                            style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 4fr) minmax(0, 1fr) minmax(0, 1.2fr)', gap: '0 16px' }}
                        >
                            <span className="text-[13px] font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">{t('notifications.col.title')}</span>
                            <span className="text-[13px] font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">{t('notifications.col.content')}</span>
                            <span className="text-[13px] font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">{t('notifications.col.type')}</span>
                            <span className="text-[13px] font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">{t('notifications.col.time')}</span>
                        </div>
                    </div>

                    {filtered.length === 0 ? (
                        <EmptyState
                            icon={<Bell className="size-8" />}
                            title={t('notifications.empty.title')}
                            description={t('notifications.empty.description')}
                        />
                    ) : (
                        <div>
                            {/* Unread section */}
                            {unreadList.length > 0 && (
                                <Collapsible defaultOpen>
                                    <CollapsibleTrigger className="flex items-center gap-2 w-full px-4 py-3 border-b border-border/40 dark:border-white/[0.08] cursor-pointer group">
                                        <span className="text-[15px] font-bold text-black dark:text-white tracking-tight group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors duration-200">
                                            {t('notifications.unread')} ({unreadList.length})
                                        </span>
                                        <ChevronDown className="size-4 text-black dark:text-white group-hover:text-black/70 dark:group-hover:text-white/70 transition-all duration-200 group-data-[state=closed]:-rotate-90" />
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                                        <div className="hidden md:block">
                                            {unreadList.slice(0, showUnread).map(n => (
                                                <NotificationRow
                                                    key={n.id}
                                                    notification={n}
                                                    unread
                                                    onClickRow={() => handleClick(n)}
                                                    onToggleStar={(e) => handleToggleStar(n, e)}
                                                    typeConfig={typeConfig}
                                                    timeAgo={timeAgo}
                                                />
                                            ))}
                                        </div>
                                        <div className="md:hidden">
                                            {unreadList.slice(0, showUnread).map(n => (
                                                <NotificationCard
                                                    key={n.id}
                                                    notification={n}
                                                    unread
                                                    onClickRow={() => handleClick(n)}
                                                    onToggleStar={(e) => handleToggleStar(n, e)}
                                                    typeConfig={typeConfig}
                                                    timeAgo={timeAgo}
                                                />
                                            ))}
                                        </div>
                                        {showUnread < unreadList.length && (
                                            <button
                                                onClick={() => setShowUnread(prev => prev + ITEMS_PER_PAGE)}
                                                className="w-full py-3 text-[14px] font-semibold text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors duration-200 cursor-pointer border-b border-border/20 dark:border-white/[0.04]"
                                            >
                                                {t('common.loadMore')} ({unreadList.length - showUnread})
                                            </button>
                                        )}
                                    </CollapsibleContent>
                                </Collapsible>
                            )}

                            {/* Read section */}
                            {readList.length > 0 && (
                                <Collapsible defaultOpen>
                                    <CollapsibleTrigger className="flex items-center gap-2 w-full px-4 py-3 border-b border-border/40 dark:border-white/[0.08] cursor-pointer group">
                                        <span className="text-[15px] font-bold text-black/40 dark:text-white/40 tracking-tight group-hover:text-black/70 dark:group-hover:text-white/70 transition-colors duration-200">
                                            {t('notifications.read')} ({readList.length})
                                        </span>
                                        <ChevronDown className="size-4 text-black/40 dark:text-white/40 group-hover:text-black/70 dark:group-hover:text-white/70 transition-all duration-200 group-data-[state=closed]:-rotate-90" />
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                                        <div className="hidden md:block">
                                            {readList.slice(0, showRead).map(n => (
                                                <NotificationRow
                                                    key={n.id}
                                                    notification={n}
                                                    unread={false}
                                                    onClickRow={() => handleClick(n)}
                                                    onToggleStar={(e) => handleToggleStar(n, e)}
                                                    typeConfig={typeConfig}
                                                    timeAgo={timeAgo}
                                                />
                                            ))}
                                        </div>
                                        <div className="md:hidden">
                                            {readList.slice(0, showRead).map(n => (
                                                <NotificationCard
                                                    key={n.id}
                                                    notification={n}
                                                    unread={false}
                                                    onClickRow={() => handleClick(n)}
                                                    onToggleStar={(e) => handleToggleStar(n, e)}
                                                    typeConfig={typeConfig}
                                                    timeAgo={timeAgo}
                                                />
                                            ))}
                                        </div>
                                        {showRead < readList.length && (
                                            <button
                                                onClick={() => setShowRead(prev => prev + ITEMS_PER_PAGE)}
                                                className="w-full py-3 text-[14px] font-semibold text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors duration-200 cursor-pointer border-b border-border/20 dark:border-white/[0.04]"
                                            >
                                                {t('common.loadMore')} ({readList.length - showRead})
                                            </button>
                                        )}
                                    </CollapsibleContent>
                                </Collapsible>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Notification Detail Dialog */}
            <Dialog open={!!viewingNotification} onOpenChange={(open) => !open && setViewingNotification(null)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader className="gap-0 space-y-0">
                        <DialogTitle className="text-[18px] font-semibold leading-normal break-words">
                            {viewingNotification?.title}
                        </DialogTitle>
                        <div className="text-[14px] text-muted-foreground">
                            {viewingNotification && timeAgo(viewingNotification.createdAt)}
                        </div>
                    </DialogHeader>
                    <div className="py-3 text-[16px] whitespace-pre-wrap text-foreground/90 leading-relaxed min-h-[15vh] max-h-[60vh] overflow-y-auto">
                        {viewingNotification?.message}
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={() => setViewingNotification(null)}
                            className="font-semibold h-10 px-6 border transition-all duration-300 bg-[var(--brand-color)] text-black border-[var(--brand-color)] hover:bg-[var(--brand-color)]/90 hover:scale-105"
                        >
                            {t('common.close')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
