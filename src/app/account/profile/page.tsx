'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { Pencil, Loader2, CheckCircle2, Calendar, Mail, Camera } from 'lucide-react';
import { BirthDatePicker } from '@/components/birth-date-picker';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
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
const profileSchema = z.object({
    email: z
        .string()
        .email('Email không hợp lệ'),
    name: z
        .string()
        .min(1, 'Vui lòng nhập họ tên')
        .max(100, 'Họ tên tối đa 100 ký tự')
        .regex(/^[\p{L}\s]+$/u, 'Họ tên chỉ chứa chữ cái'),
    phone: z
        .string()
        .optional()
        .refine(val => !val || /^[0-9+\-\s()]+$/.test(val), 'Số điện thoại không hợp lệ')
        .refine(val => !val || val.replace(/[\s\-()]/g, '').length >= 9, 'Số điện thoại tối thiểu 9 số')
        .refine(val => !val || val.replace(/[\s\-()]/g, '').length <= 15, 'Số điện thoại tối đa 15 số'),
    gender: z.enum(['male', 'female', 'other']).optional(),
    otherGender: z.string().max(50, 'Tối đa 50 ký tự').optional(),
    dateOfBirth: z
        .string()
        .optional()
        .refine(val => {
            if (!val) return true;
            const d = new Date(val);
            return d.getFullYear() >= 1920;
        }, 'Ngày sinh không hợp lệ')
        .refine(val => {
            if (!val) return true;
            const d = new Date(val);
            const today = new Date();
            const age18 = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
            return d <= age18;
        }, 'Bạn phải đủ 18 tuổi'),
}).refine(
    data => {
        if (data.gender === 'other') {
            return !!data.otherGender && data.otherGender.trim().length > 0;
        }
        return true;
    },
    {
        message: 'Vui lòng nhập giới tính',
        path: ['otherGender'],
    }
);

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileData {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    gender: string | null;
    dateOfBirth: string | null;
    image: string | null;
    createdAt: string;
    emailVerified: string | null;
}

// ── ReadOnly Field (matching Web design) ──
function ReadOnlyField({
    label,
    value,
}: {
    label: React.ReactNode;
    value: string | React.ReactNode;
}) {
    return (
        <div className="py-2">
            <div className="text-[14px] font-normal text-muted-foreground mb-1">
                {label}
            </div>
            <div className="text-[16px] font-medium text-foreground">
                {value || (
                    <span className="text-muted-foreground/50">
                        —
                    </span>
                )}
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [avatarUploading, setAvatarUploading] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);



    // Profile OTP state
    const [profileOtpDialogOpen, setProfileOtpDialogOpen] = useState(false);
    const [profileOtp, setProfileOtp] = useState('');
    const [profileOtpSending, setProfileOtpSending] = useState(false);
    const [profileOtpError, setProfileOtpError] = useState('');
    const [pendingProfileData, setPendingProfileData] = useState<ProfileFormData | null>(null);

    const form = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        mode: 'onSubmit',
        reValidateMode: 'onSubmit',
        defaultValues: {
            email: '',
            name: '',
            phone: '',
            gender: undefined,
            otherGender: '',
            dateOfBirth: '',
        },
    });

    const { isDirty } = useFormState({ control: form.control });

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?callbackUrl=/account/profile');
            return;
        }
        if (status === 'authenticated') {
            fetchProfile();
        }
    }, [status]);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/account/profile');
            if (res.ok) {
                const data = await res.json();
                const user = data.user;
                setProfile(user);
                const genderVal = user.gender;
                const isStandard = ['male', 'female', 'other'].includes(genderVal || '');
                form.reset({
                    email: user.email || '',
                    name: user.name || '',
                    phone: user.phone || '',
                    gender: isStandard ? genderVal : (genderVal ? 'other' : undefined),
                    otherGender: (!isStandard && genderVal) ? genderVal : '',
                    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
                });
            }
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: ProfileFormData) => {
        // Step 1: Send OTP to current email before saving
        setPendingProfileData(data);
        setProfileOtpSending(true);
        setProfileOtpError('');
        try {
            const res = await fetch('/api/auth/otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: profile?.email,
                    type: 'email',
                    purpose: 'editProfile',
                }),
            });
            if (res.ok) {
                setProfileOtpDialogOpen(true);
                setProfileOtp('');
            } else {
                setProfileOtpError('Không thể gửi mã xác nhận');
            }
        } catch {
            setProfileOtpError('Đã xảy ra lỗi, vui lòng thử lại');
        } finally {
            setProfileOtpSending(false);
        }
    };

    // Step 2: Verify OTP then save profile
    const handleProfileOtpVerify = async () => {
        if (profileOtp.length !== 6) {
            setProfileOtpError('Vui lòng nhập đủ 6 số');
            return;
        }
        if (!pendingProfileData) return;

        setSaving(true);
        setProfileOtpError('');
        try {
            // Verify OTP first
            const otpRes = await fetch('/api/auth/otp', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: profile?.email,
                    otp: profileOtp,
                }),
            });
            if (!otpRes.ok) {
                const otpData = await otpRes.json();
                setProfileOtpError(otpData.error || 'Mã OTP không hợp lệ hoặc đã hết hạn');
                return;
            }

            // OTP verified — check if email changed
            const emailChanged = pendingProfileData.email.toLowerCase() !== profile?.email?.toLowerCase();

            if (emailChanged) {
                // Update email via change-email API
                const emailRes = await fetch('/api/account/change-email', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        newEmail: pendingProfileData.email,
                        otp: profileOtp,
                    }),
                });
                if (!emailRes.ok) {
                    const emailData = await emailRes.json();
                    setProfileOtpError(emailData.error || 'Không thể cập nhật email');
                    return;
                }
            }

            // Save other profile fields
            const res = await fetch('/api/account/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: pendingProfileData.name,
                    phone: pendingProfileData.phone,
                    gender: pendingProfileData.gender === 'other'
                        ? (pendingProfileData.otherGender || 'other')
                        : pendingProfileData.gender,
                    dateOfBirth: pendingProfileData.dateOfBirth,
                }),
            });
            if (res.ok) {
                setProfileOtpDialogOpen(false);
                setSuccessMessage('Thông tin cá nhân đã được cập nhật thành công!');
                setIsEditing(false);
                setPendingProfileData(null);
                fetchProfile();
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        } catch {
            setProfileOtpError('Đã xảy ra lỗi, vui lòng thử lại');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        form.reset();
        setIsEditing(false);
    };

    const getJoinedText = (dateStr: string) => {
        const d = new Date(dateStr);
        const weekday = d.toLocaleDateString('vi-VN', { weekday: 'long' });
        const day = d.getDate();
        const month = d.getMonth() + 1;
        const year = d.getFullYear();
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        return `Tham gia lúc ${hours}:${minutes}, ${weekday}, ngày ${day} tháng ${month} năm ${year}`;
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert('Ảnh tối đa 5MB');
            return;
        }
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file ảnh');
            return;
        }
        setAvatarUploading(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            const res = await fetch('/api/account/avatar', {
                method: 'POST',
                body: formData,
            });
            if (res.ok) {
                await fetchProfile();
                setSuccessMessage('Ảnh đại diện đã được cập nhật!');
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        } catch {
            // silent
        } finally {
            setAvatarUploading(false);
            if (avatarInputRef.current) avatarInputRef.current.value = '';
        }
    };

    const getGenderLabel = (g: string | undefined) => {
        if (g === 'male') return 'Nam';
        if (g === 'female') return 'Nữ';
        if (g === 'other') {
            const other = form.getValues('otherGender');
            return other || 'Khác';
        }
        return '';
    };



    if (loading || status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="w-full h-full mx-auto space-y-6">
            <PageHeader
                title="Hồ Sơ Cá Nhân"
                description="Quản lý thông tin cá nhân của bạn"
            />

            {/* ── Single Profile Card ── */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card className="page-card overflow-hidden">
                        <CardContent className="p-0">
                            {/* ── Header: Avatar + Info ── */}
                            <div className="px-6 py-5">
                                <div className="flex items-center gap-5 w-full">
                                    {/* Avatar with upload */}
                                    <div className="relative group">
                                        <input
                                            ref={avatarInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleAvatarUpload}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => avatarInputRef.current?.click()}
                                            disabled={avatarUploading}
                                            className="relative w-[72px] h-[72px] rounded-full overflow-hidden flex-shrink-0 cursor-pointer focus:outline-none ring-2 ring-[var(--brand-color)]/20 ring-offset-2 ring-offset-background"
                                        >
                                            {profile?.image ? (
                                                <img
                                                    src={profile.image}
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-[var(--brand-color)] flex items-center justify-center text-2xl font-bold text-black/90">
                                                    {profile?.name?.charAt(0)?.toUpperCase() || session?.user?.email?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                                                {avatarUploading
                                                    ? <Loader2 className="size-5 text-white animate-spin" />
                                                    : <Camera className="size-5 text-white" />
                                                }
                                            </div>
                                        </button>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 space-y-0.5">
                                        <h1 className="text-[18px] font-semibold text-foreground">
                                            {profile?.name || 'Chưa đặt tên'}
                                        </h1>
                                        <div className="text-muted-foreground flex flex-col gap-0.5 text-[14px] font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="size-3.5" />
                                                {profile?.createdAt ? getJoinedText(profile.createdAt) : ''}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Mail className="size-3.5" />
                                                {profile?.email}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Divider ── */}
                            <div className="border-t border-border" />

                            {/* ── Profile Fields ── */}
                            <div className="px-6 py-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-8 md:gap-y-6 max-w-2xl">
                                    {/* Row 1: Name + Email */}
                                    <div className="w-full">
                                        {isEditing ? (
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <FloatingLabelInput
                                                                label="Họ và tên"
                                                                className="app-text-input"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        ) : (
                                            <ReadOnlyField
                                                label="Họ và tên"
                                                value={form.getValues('name')}
                                            />
                                        )}
                                    </div>

                                    <div className="w-full">
                                        {isEditing ? (
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <FloatingLabelInput
                                                                type="email"
                                                                label="Email"
                                                                className="app-text-input"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        ) : (
                                            <ReadOnlyField
                                                label="Email"
                                                value={form.getValues('email')}
                                            />
                                        )}
                                    </div>

                                    {/* Row 2: Phone + Birthday */}
                                    <div className="w-full">
                                        {isEditing ? (
                                            <FormField
                                                control={form.control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <FloatingLabelInput
                                                                label="Số điện thoại"
                                                                className="app-text-input"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        ) : (
                                            <ReadOnlyField
                                                label="Số điện thoại"
                                                value={form.getValues('phone')}
                                            />
                                        )}
                                    </div>

                                    <div className="w-full">
                                        {isEditing ? (
                                            <FormField
                                                control={form.control}
                                                name="dateOfBirth"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <BirthDatePicker
                                                                onDateChange={(date) => {
                                                                    field.onChange(date ? date.toISOString().split('T')[0] : '');
                                                                }}
                                                                value={field.value || undefined}
                                                                buttonClass="w-full dark:bg-transparent dark:hover:bg-transparent"
                                                                label="Ngày sinh"
                                                                isFloatingLabel={true}
                                                                isMarginVisible={false}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        ) : (
                                            <ReadOnlyField
                                                label="Ngày sinh"
                                                value={form.getValues('dateOfBirth')
                                                    ? new Date(form.getValues('dateOfBirth')!).toLocaleDateString('vi-VN')
                                                    : ''
                                                }
                                            />
                                        )}
                                    </div>

                                    {/* Row 3: Gender */}
                                    <div className="w-full md:col-span-2">
                                        {isEditing ? (
                                            <FormField
                                                control={form.control}
                                                name="gender"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1">
                                                        <FormControl>
                                                            <RadioGroup
                                                                onValueChange={field.onChange}
                                                                value={field.value || ''}
                                                                className="flex items-center flex-wrap gap-x-1"
                                                            >
                                                                {(['male', 'female', 'other'] as const).map(g => (
                                                                    <FormItem key={g} className="flex items-center space-x-1 space-y-0">
                                                                        <FormControl>
                                                                            <RadioGroupItem
                                                                                className="data-[state=checked]:border-brand-text dark:data-[state=checked]:border-[var(--brand-color)] cursor-pointer dark:[&_*_svg]:fill-[var(--brand-color)] dark:[&_*_svg]:stroke-[var(--brand-color)]"
                                                                                value={g}
                                                                                onClick={() => {
                                                                                    if (field.value === g) field.onChange(undefined);
                                                                                }}
                                                                            />
                                                                        </FormControl>
                                                                        <label
                                                                            className={cn(
                                                                                'font-semibold transition-colors text-[14px] cursor-pointer',
                                                                                field.value === g
                                                                                    ? 'text-brand-text dark:text-[var(--brand-color)]'
                                                                                    : 'text-muted-foreground'
                                                                            )}
                                                                        >
                                                                            {g === 'male' ? 'Nam' : g === 'female' ? 'Nữ' : 'Khác'}
                                                                        </label>
                                                                    </FormItem>
                                                                ))}

                                                                {field.value === 'other' && (
                                                                    <FormField
                                                                        control={form.control}
                                                                        name="otherGender"
                                                                        render={({ field: otherField }) => (
                                                                            <FormItem className="ml-3 flex-1 min-w-[120px]">
                                                                                <FormControl>
                                                                                    <FloatingLabelInput
                                                                                        label="Tự mô tả"
                                                                                        className="app-text-input"
                                                                                        {...otherField}
                                                                                    />
                                                                                </FormControl>
                                                                                <FormMessage />
                                                                            </FormItem>
                                                                        )}
                                                                    />
                                                                )}
                                                            </RadioGroup>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        ) : (
                                            <ReadOnlyField
                                                label="Giới tính"
                                                value={getGenderLabel(form.getValues('gender'))}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* ── Success message ── */}
                                {successMessage && (
                                    <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 bg-muted/50 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <CheckCircle2 className="size-5 text-black dark:text-[var(--brand-color)] flex-shrink-0" />
                                        <p className="text-sm font-medium text-brand-text dark:text-white">
                                            {successMessage}
                                        </p>
                                    </div>
                                )}

                                {/* ── Actions ── */}
                                {isEditing ? (
                                    <div className="flex justify-center pt-5 gap-3 animate-in fade-in duration-200">
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
                                            disabled={!isDirty || saving || profileOtpSending}
                                            className={cn(
                                                'font-semibold h-10 px-3 text-[16px]! border transition-all duration-300',
                                                isDirty && !saving && !profileOtpSending
                                                    ? 'bg-[var(--brand-color)] text-black/90 border-[var(--brand-color)] hover:bg-[var(--brand-color)]/90 hover:scale-105'
                                                    : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-white border-neutral-400 dark:border-neutral-600 cursor-not-allowed opacity-100'
                                            )}
                                        >
                                            {(saving || profileOtpSending) && <Loader2 className="size-4 animate-spin mr-2" />}
                                            Lưu Thay Đổi
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex justify-center pt-5">
                                        <Button
                                            type="button"
                                            onClick={() => setIsEditing(true)}
                                            className="font-semibold h-10 px-3 text-[16px]! border transition-all duration-300 bg-[var(--brand-color)] text-black/90 border-[var(--brand-color)] hover:bg-[var(--brand-color)]/90 hover:scale-105"
                                        >
                                            <Pencil className="w-4 h-4" />
                                            Chỉnh Sửa
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>


            {/* ── Profile Update OTP Dialog ── */}
            <Dialog open={profileOtpDialogOpen} onOpenChange={(open) => {
                setProfileOtpDialogOpen(open);
                if (!open) { setProfileOtp(''); setProfileOtpError(''); }
            }}>
                <DialogContent className="sm:max-w-md bg-background border-border">
                    <DialogHeader>
                        <DialogTitle className="text-[18px] font-semibold">
                            Xác minh thay đổi
                        </DialogTitle>
                        <DialogDescription className="text-[14px] text-muted-foreground">
                            Mã xác nhận 6 số đã được gửi đến <span className="font-semibold text-foreground">{profile?.email}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-2">
                        <div className="flex justify-center">
                            <InputOTP
                                maxLength={6}
                                value={profileOtp}
                                onChange={setProfileOtp}
                            >
                                <InputOTPGroup>
                                    {[0, 1, 2, 3, 4, 5].map(i => (
                                        <InputOTPSlot
                                            key={i}
                                            index={i}
                                            className="w-11 h-12 text-lg font-semibold border-input"
                                        />
                                    ))}
                                </InputOTPGroup>
                            </InputOTP>
                        </div>

                        {profileOtpError && (
                            <p className="text-sm text-red-500 font-medium text-center">{profileOtpError}</p>
                        )}

                        <div className="flex gap-3 justify-end pt-1">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => { setProfileOtpDialogOpen(false); setProfileOtp(''); setProfileOtpError(''); }}
                                className="text-muted-foreground"
                            >
                                Hủy
                            </Button>
                            <Button
                                type="button"
                                disabled={saving}
                                onClick={handleProfileOtpVerify}
                                className="font-semibold bg-[var(--brand-color)] text-black/90 border border-[var(--brand-color)] hover:bg-[var(--brand-color)]/90"
                            >
                                {saving && <Loader2 className="size-4 animate-spin mr-2" />}
                                Xác nhận
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
