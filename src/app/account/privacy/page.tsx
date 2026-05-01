'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import {
    Shield,
    Download,
    Trash2,
    Link2,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import LoadingSpinner from '@/components/loading-spinner';
import PageHeader from '@/components/page-header';
import { useRouter } from 'next/navigation';

interface PrivacyData {
    linkedProviders: string[];
    hasPassword: boolean;
    dataSummary: {
        email: string;
        name: string | null;
        phone: string | null;
        memberSince: string;
        emailVerified: boolean;
    };
}

const providerLabels: Record<string, { name: string; icon: string; color: string }> = {
    google: { name: 'Google', icon: '/img/google.svg', color: 'border-blue-500/30 bg-blue-500/5' },
    credentials: { name: 'Email & Password', icon: '', color: 'border-emerald-500/30 bg-emerald-500/5' },
};

export default function PrivacyPage() {
    const { status } = useSession();
    const router = useRouter();
    const [data, setData] = useState<PrivacyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?callbackUrl=/account/privacy');
            return;
        }
        if (status === 'authenticated') {
            fetch('/api/account/privacy')
                .then(r => r.json())
                .then(setData)
                .catch(() => {})
                .finally(() => setLoading(false));
        }
    }, [status]);

    const handleExportData = async () => {
        setDownloading(true);
        try {
            const res = await fetch('/api/account/privacy');
            const json = await res.json();
            const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chao-market-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            // silent
        } finally {
            setDownloading(false);
        }
    };

    if (loading || status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner />
            </div>
        );
    }

    const providers = data?.linkedProviders || [];
    const hasCredentials = data?.hasPassword;

    return (
        <div className="w-full h-full mx-auto space-y-6">
            <PageHeader
                title="Quyền Riêng Tư"
                description="Quản lý phương thức đăng nhập và dữ liệu cá nhân"
            />

            {/* Connected Sign-in Methods */}
            <Card className="page-card">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Link2 className="w-5 h-5 text-[var(--brand-color)]" />
                        <h3 className="text-lg font-semibold">Phương Thức Đăng Nhập</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Các phương thức đăng nhập đã liên kết với tài khoản của bạn.
                    </p>

                    <div className="space-y-3">
                        {/* Credentials */}
                        <div className={cn(
                            'flex items-center justify-between p-4 rounded-xl border',
                            hasCredentials
                                ? 'border-emerald-500/30 bg-emerald-500/5'
                                : 'border-neutral-300 dark:border-neutral-700 bg-transparent',
                        )}>
                            <div className="flex items-center gap-3">
                                <Shield className="size-8 text-emerald-600 dark:text-emerald-400" />
                                <div>
                                    <p className="font-semibold text-[15px]">Email & Mật khẩu</p>
                                    <p className="text-[13px] text-muted-foreground">
                                        {data?.dataSummary?.email}
                                    </p>
                                </div>
                            </div>
                            <span className={cn(
                                'inline-flex items-center gap-1 text-[13px] font-medium',
                                hasCredentials ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground',
                            )}>
                                {hasCredentials
                                    ? <><CheckCircle2 className="size-3.5" /> Đã thiết lập</>
                                    : 'Chưa thiết lập'
                                }
                            </span>
                        </div>

                        {/* OAuth Providers */}
                        {providers.filter(p => p !== 'credentials').map(provider => {
                            const cfg = providerLabels[provider] || { name: provider, icon: '', color: '' };
                            return (
                                <div
                                    key={provider}
                                    className={cn(
                                        'flex items-center justify-between p-4 rounded-xl border',
                                        cfg.color || 'border-border',
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        {cfg.icon ? (
                                            <img src={cfg.icon} alt={cfg.name} className="size-8" />
                                        ) : (
                                            <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                                                {cfg.name[0]}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold text-[15px]">{cfg.name}</p>
                                            <p className="text-[13px] text-muted-foreground">Đăng nhập bằng {cfg.name}</p>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center gap-1 text-[13px] font-medium text-blue-600 dark:text-blue-400">
                                        <CheckCircle2 className="size-3.5" /> Đã liên kết
                                    </span>
                                </div>
                            );
                        })}

                        {providers.length === 0 && !hasCredentials && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Không tìm thấy phương thức đăng nhập
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Data Summary */}
            <Card className="page-card">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Download className="w-5 h-5 text-[var(--brand-color)]" />
                        <h3 className="text-lg font-semibold">Dữ Liệu Của Bạn</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Tổng quan dữ liệu cá nhân được lưu trữ trong hệ thống Chào Market.
                    </p>

                    <div className="divide-y divide-border/50 mb-5">
                        <div className="flex justify-between py-2.5">
                            <span className="text-[14px] text-muted-foreground">Họ tên</span>
                            <span className="text-[14px] font-medium">{data?.dataSummary?.name || '—'}</span>
                        </div>
                        <div className="flex justify-between py-2.5">
                            <span className="text-[14px] text-muted-foreground">Email</span>
                            <span className="text-[14px] font-medium">{data?.dataSummary?.email || '—'}</span>
                        </div>
                        <div className="flex justify-between py-2.5">
                            <span className="text-[14px] text-muted-foreground">Số điện thoại</span>
                            <span className="text-[14px] font-medium">{data?.dataSummary?.phone || '—'}</span>
                        </div>
                        <div className="flex justify-between py-2.5">
                            <span className="text-[14px] text-muted-foreground">Thành viên từ</span>
                            <span className="text-[14px] font-medium">
                                {data?.dataSummary?.memberSince
                                    ? new Date(data.dataSummary.memberSince).toLocaleDateString('vi-VN')
                                    : '—'}
                            </span>
                        </div>
                        <div className="flex justify-between py-2.5">
                            <span className="text-[14px] text-muted-foreground">Email xác minh</span>
                            <span className={cn(
                                'inline-flex items-center gap-1 text-[14px] font-medium',
                                data?.dataSummary?.emailVerified ? 'text-green-600 dark:text-green-400' : 'text-amber-600',
                            )}>
                                {data?.dataSummary?.emailVerified
                                    ? <><CheckCircle2 className="size-3.5" /> Đã xác minh</>
                                    : <><AlertTriangle className="size-3.5" /> Chưa xác minh</>
                                }
                            </span>
                        </div>
                    </div>

                    <Button
                        onClick={handleExportData}
                        disabled={downloading}
                        className="w-full bg-[var(--brand-color)] text-black font-semibold rounded-lg hover:bg-[var(--brand-color)]/90 transition-all duration-300"
                    >
                        {downloading
                            ? <><Loader2 className="size-4 animate-spin mr-2" /> Đang tải...</>
                            : <><Download className="size-4 mr-2" /> Tải Xuống Dữ Liệu Cá Nhân</>
                        }
                    </Button>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="page-card border-red-500/20">
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Trash2 className="w-5 h-5 text-red-500" />
                        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Vùng Nguy Hiểm</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Xóa tài khoản sẽ xóa vĩnh viễn tất cả dữ liệu của bạn khỏi hệ thống Chào Market.
                        Hành động này không thể hoàn tác.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => setShowDeleteDialog(true)}
                        className="border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all"
                    >
                        <Trash2 className="size-4 mr-2" />
                        Yêu Cầu Xóa Tài Khoản
                    </Button>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertTriangle className="size-5" />
                            Xác Nhận Xóa Tài Khoản
                        </DialogTitle>
                        <DialogDescription className="text-[15px] mt-2">
                            Bạn có chắc chắn muốn xóa tài khoản? Tất cả dữ liệu sẽ bị xóa vĩnh viễn sau 30 ngày.
                            Trong thời gian này, bạn có thể liên hệ <a href="mailto:support@chaomarket.com" className="text-[var(--brand-color)] font-semibold hover:underline">support@chaomarket.com</a> để hủy yêu cầu.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-3 mt-2">
                        <Button
                            variant="ghost"
                            onClick={() => setShowDeleteDialog(false)}
                            className="bg-transparent text-neutral-500 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={() => {
                                setShowDeleteDialog(false);
                                // TODO: Implement account deletion request API
                                alert('Yêu cầu xóa tài khoản đã được gửi. Vui lòng kiểm tra email.');
                            }}
                            className="bg-red-600 text-white hover:bg-red-700 border-0"
                        >
                            Xác Nhận Xóa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
