'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import {
    Monitor,
    Smartphone,
    Tablet,
    Globe,
    Clock,
    Shield,
    CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import LoadingSpinner from '@/components/loading-spinner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DeviceItem {
    id: string;
    deviceName: string | null;
    deviceType: string | null;
    browser: string | null;
    os: string | null;
    ipAddress: string | null;
    location: string | null;
    lastActiveAt: string;
    isCurrent: boolean;
}

const deviceIcons: Record<string, React.ReactNode> = {
    desktop: <Monitor className="size-6" />,
    mobile: <Smartphone className="size-6" />,
    tablet: <Tablet className="size-6" />,
};

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
}

export default function DevicesPage() {
    const { status } = useSession();
    const router = useRouter();
    const [devices, setDevices] = useState<DeviceItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?callbackUrl=/account/security/devices');
            return;
        }
        if (status === 'authenticated') {
            fetch('/api/account/devices')
                .then(r => r.json())
                .then(data => setDevices(data.devices || []))
                .catch(() => {})
                .finally(() => setLoading(false));
        }
    }, [status]);

    if (loading || status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="w-full h-full mx-auto space-y-6">
            {/* Header */}
            <Card className="bg-transparent">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Shield className="size-5 text-[var(--brand-color)]" />
                            <h3 className="text-lg font-semibold">Thiết Bị Của Bạn</h3>
                        </div>
                        <Link
                            href="/account/security"
                            className="text-[13px] font-medium text-[var(--brand-color)] hover:underline"
                        >
                            ← Bảo mật
                        </Link>
                    </div>
                    <p className="text-sm text-muted-foreground mb-5">
                        Các thiết bị đã đăng nhập vào tài khoản của bạn. Nếu phát hiện thiết bị lạ, hãy đổi mật khẩu ngay.
                    </p>

                    {devices.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Globe className="size-8 mb-2 opacity-30" />
                            <p className="text-base">Chưa có dữ liệu thiết bị</p>
                            <p className="text-sm mt-1">
                                Dữ liệu sẽ được thu thập sau khi bảng <code className="text-xs bg-muted px-1 py-0.5 rounded">user_devices</code> được migrate.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {devices.map(device => (
                                <div
                                    key={device.id}
                                    className={cn(
                                        'flex items-center gap-4 p-4 rounded-xl border transition-all',
                                        device.isCurrent
                                            ? 'border-green-500/30 bg-green-500/5'
                                            : 'border-black/10 dark:border-white/10',
                                    )}
                                >
                                    <div className={cn(
                                        'size-10 rounded-lg flex items-center justify-center',
                                        device.isCurrent
                                            ? 'text-green-600 dark:text-green-400 bg-green-500/10'
                                            : 'text-muted-foreground bg-muted',
                                    )}>
                                        {deviceIcons[device.deviceType || 'desktop'] || <Globe className="size-6" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-[15px] truncate">
                                                {device.deviceName || device.browser || 'Unknown Device'}
                                            </p>
                                            {device.isCurrent && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-500/15 text-green-600 dark:text-green-400">
                                                    <CheckCircle2 className="size-3" />
                                                    Hiện tại
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[13px] text-muted-foreground mt-0.5">
                                            {[device.os, device.browser, device.location].filter(Boolean).join(' · ') || 'Không rõ'}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1 text-[13px] text-muted-foreground flex-shrink-0">
                                        <Clock className="size-3.5" />
                                        {timeAgo(device.lastActiveAt)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
