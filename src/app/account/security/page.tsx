'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Clock, Eye, EyeOff, CheckCircle2, Loader2, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FloatingLabelInput } from '@/components/ui/floating-input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import { useForm, useFormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import LoadingSpinner from '@/components/loading-spinner';
import PageHeader from '@/components/page-header';
import { useRouter } from 'next/navigation';

// ── Schema ──
const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
        newPassword: z.string().min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự'),
        confirmNewPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
    })
    .refine(data => data.newPassword === data.confirmNewPassword, {
        message: 'Mật khẩu xác nhận không khớp',
        path: ['confirmNewPassword'],
    });

type PasswordFormData = z.infer<typeof passwordSchema>;

interface AuditLog {
    action: string;
    ipAddress: string | null;
    createdAt: string;
}

const actionLabels: Record<string, string> = {
    login: 'Đăng nhập',
    register: 'Đăng ký',
    password_change: 'Đổi mật khẩu',
    password_reset: 'Đặt lại mật khẩu',
    password_reset_request: 'Yêu cầu đặt lại mật khẩu',
    profile_update: 'Cập nhật hồ sơ',
    otp_send: 'Gửi mã OTP',
    otp_verify: 'Xác minh OTP',
};

export default function SecurityPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

    const form = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        mode: 'onSubmit',
        reValidateMode: 'onSubmit',
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
        },
    });

    useFormState({ control: form.control });
    const watchedFields = form.watch();
    const allFieldsFilled = Boolean(
        watchedFields.currentPassword &&
        watchedFields.newPassword &&
        watchedFields.confirmNewPassword
    );

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?callbackUrl=/account/security');
            return;
        }
        if (status === 'authenticated') {
            fetchAuditLogs();
        }
    }, [status]);

    const fetchAuditLogs = async () => {
        try {
            const res = await fetch('/api/account/security/audit-logs');
            if (res.ok) {
                const data = await res.json();
                setAuditLogs(data.logs || []);
            }
        } catch {
            // silent
        }
    };

    const onSubmit = async (data: PasswordFormData) => {
        setSaving(true);
        try {
            const res = await fetch('/api/account/security/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword,
                }),
            });
            if (res.ok) {
                setSuccessMessage('Mật khẩu đã được thay đổi thành công!');
                form.reset();
                fetchAuditLogs();
                setTimeout(() => setSuccessMessage(''), 5000);
            } else {
                const err = await res.json();
                form.setError('currentPassword', {
                    message: err.message || 'Đổi mật khẩu thất bại',
                });
            }
        } catch {
            form.setError('currentPassword', { message: 'Lỗi kết nối' });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        form.reset();
    };

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="w-full h-full mx-auto space-y-6">
            <PageHeader
                title="Bảo Mật"
                description="Quản lý mật khẩu và bảo vệ tài khoản của bạn"
            />

            {/* ── Change Password Card ── */}
            <Card className="page-card">
                <CardContent className="p-6">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold">Đổi Mật Khẩu</h3>
                            <p className="text-sm text-muted-foreground">
                                Cập nhật mật khẩu của bạn để bảo vệ tài khoản
                            </p>
                        </div>

                        {/* Success message */}
                        {successMessage && (
                            <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <CheckCircle2 className="size-5 text-green-500 flex-shrink-0" />
                                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                    {successMessage}
                                </p>
                            </div>
                        )}

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                                <FormField
                                    control={form.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <FloatingLabelInput
                                                    label={
                                                        <span className="inline-flex items-center gap-1">
                                                            Mật khẩu hiện tại
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                                className="pointer-events-auto cursor-pointer inline-flex items-center"
                                                            >
                                                                {showCurrentPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                                            </button>
                                                        </span>
                                                    }
                                                    className="app-text-input"
                                                    type={showCurrentPassword ? 'text' : 'password'}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <FloatingLabelInput
                                                    label={
                                                        <span className="inline-flex items-center gap-1">
                                                            Mật khẩu mới
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                                className="pointer-events-auto cursor-pointer inline-flex items-center"
                                                            >
                                                                {showNewPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                                            </button>
                                                        </span>
                                                    }
                                                    className="app-text-input"
                                                    type={showNewPassword ? 'text' : 'password'}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmNewPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <FloatingLabelInput
                                                    label={
                                                        <span className="inline-flex items-center gap-1">
                                                            Xác nhận mật khẩu mới
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                className="pointer-events-auto cursor-pointer inline-flex items-center"
                                                            >
                                                                {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                                            </button>
                                                        </span>
                                                    }
                                                    className="app-text-input"
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Actions */}
                                <div className="flex justify-center pt-4 gap-3">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={handleCancel}
                                        className="bg-transparent text-[16px]! text-neutral-500 border border-neutral-300 dark:border-neutral-600 hover:text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={!allFieldsFilled || saving}
                                        className={cn(
                                            'font-semibold h-10 px-3 text-[16px]! border transition-all duration-300',
                                            allFieldsFilled && !saving
                                                ? 'bg-[var(--brand-color)] text-black border-[var(--brand-color)] hover:bg-[var(--brand-color)]/90 hover:scale-105'
                                                : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-white border-neutral-400 dark:border-neutral-600 cursor-not-allowed opacity-100'
                                        )}
                                    >
                                        {saving && <Loader2 className="size-4 animate-spin mr-2" />}
                                        Đổi Mật Khẩu
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </CardContent>
            </Card>

            {/* ── Security Overview Cards ── */}
            <Card className="page-card">
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Bảo Mật Tài Khoản</h3>
                    <div className="space-y-3">
                        {/* Devices */}
                        <a
                            href="/account/security/devices"
                            className="group flex items-center justify-between p-4 rounded-xl border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all duration-300 hover:shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    <Clock className="size-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-[15px] group-hover:text-[var(--brand-color)] transition-colors">Thiết Bị Đã Đăng Nhập</p>
                                    <p className="text-[13px] text-muted-foreground">Xem và quản lý các phiên đăng nhập</p>
                                </div>
                            </div>
                            <span className="text-muted-foreground group-hover:text-[var(--brand-color)]">→</span>
                        </a>

                        {/* 2FA */}
                        <a
                            href="/account/security/two-factor"
                            className="group flex items-center justify-between p-4 rounded-xl border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all duration-300 hover:shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                    <CheckCircle2 className="size-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-[15px] group-hover:text-[var(--brand-color)] transition-colors">Xác Thực 2 Bước (2FA)</p>
                                    <p className="text-[13px] text-muted-foreground">Bảo vệ tài khoản bằng ứng dụng xác thực</p>
                                </div>
                            </div>
                            <span className="text-muted-foreground group-hover:text-[var(--brand-color)]">→</span>
                        </a>
                    </div>
                </CardContent>
            </Card>

            {/* ── Audit Logs Card ── */}
            <Card className="page-card">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[var(--brand-color)]" />
                            <h3 className="text-lg font-semibold">Hoạt Động Gần Đây</h3>
                        </div>

                        {auditLogs.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">
                                Chưa có hoạt động nào được ghi nhận
                            </p>
                        ) : (
                            <div className="divide-y divide-border">
                                {auditLogs.map((log, i) => (
                                    <div key={i} className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                {actionLabels[log.action] || log.action}
                                            </p>
                                            {log.ipAddress && (
                                                <p className="text-xs text-muted-foreground">
                                                    IP: {log.ipAddress}
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(log.createdAt).toLocaleString('vi-VN')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
