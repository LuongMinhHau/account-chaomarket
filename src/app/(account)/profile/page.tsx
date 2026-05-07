'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { Pencil, Loader2, CheckCircle2, Calendar, Mail, Camera, AlertCircle } from 'lucide-react';
import AvatarCropDialog from '@/components/avatar-crop-dialog';
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
import { usePageTitle } from '@/hooks/use-page-title';
import { useI18n } from '@/context/i18n/context';

// ── Schema ──
function createProfileSchema(t: (key: any) => string) {
    return z.object({
        email: z
            .string()
            .email(t('account.profilePage.emailInvalid')),
        name: z
            .string()
            .min(1, t('account.profilePage.nameRequired'))
            .max(100, t('account.profilePage.nameMax'))
            .regex(/^[\p{L}\s]+$/u, t('account.profilePage.nameLettersOnly')),
        phone: z
            .string()
            .optional()
            .refine(val => !val || /^[0-9+\-\s()]+$/.test(val), t('account.profilePage.phoneInvalid'))
            .refine(val => !val || val.replace(/[\s\-()]/g, '').length >= 9, t('account.profilePage.phoneMin'))
            .refine(val => !val || val.replace(/[\s\-()]/g, '').length <= 15, t('account.profilePage.phoneMax')),
        gender: z.enum(['male', 'female', 'other']).optional(),
        otherGender: z.string().max(50, t('account.profilePage.genderCustomMax')).optional(),
        dateOfBirth: z
            .string()
            .optional()
            .refine(val => {
                if (!val) return true;
                const d = new Date(val);
                return d.getFullYear() >= 1920;
            }, t('account.profilePage.dobInvalid'))
            .refine(val => {
                if (!val) return true;
                const d = new Date(val);
                const today = new Date();
                const age18 = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                return d <= age18;
            }, t('account.profilePage.dobMinAge')),
    }).refine(
        data => {
            if (data.gender === 'other') {
                return !!data.otherGender && data.otherGender.trim().length > 0;
            }
            return true;
        },
        {
            message: t('account.profilePage.genderRequired'),
            path: ['otherGender'],
        }
    );
}



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
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const { t, locale } = useI18n();
    usePageTitle('account.profile');
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [avatarUploading, setAvatarUploading] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [avatarCropSrc, setAvatarCropSrc] = useState<string>('');
    const [avatarCropOpen, setAvatarCropOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [avatarKey, setAvatarKey] = useState(0);
    const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
    const [avatarOtpDialogOpen, setAvatarOtpDialogOpen] = useState(false);
    const [avatarOtp, setAvatarOtp] = useState('');
    const [avatarOtpError, setAvatarOtpError] = useState('');
    const [avatarOtpSending, setAvatarOtpSending] = useState(false);



    // Profile OTP state
    const [profileOtpDialogOpen, setProfileOtpDialogOpen] = useState(false);
    const [profileOtp, setProfileOtp] = useState('');
    const [profileOtpSending, setProfileOtpSending] = useState(false);
    const [profileOtpError, setProfileOtpError] = useState('');
    const [pendingProfileData, setPendingProfileData] = useState<ProfileFormData | null>(null);

    const profileSchema = createProfileSchema(t);
    type ProfileFormData = z.infer<typeof profileSchema>;

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
            router.push('/auth/login?callbackUrl=/profile');
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
                // Sync sidebar avatar if session is stale
                if (user.image !== session?.user?.image) {
                    await update();
                }
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
                setProfileOtpError(t('account.profilePage.otpSendFailed'));
            }
        } catch {
            setProfileOtpError(t('account.profilePage.genericError'));
        } finally {
            setProfileOtpSending(false);
        }
    };

    // Step 2: Verify OTP then save profile
    const handleProfileOtpVerify = async () => {
        if (profileOtp.length !== 6) {
            setProfileOtpError(t('account.profilePage.otpPlaceholder'));
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
                setProfileOtpError(otpData.error || t('account.profilePage.otpInvalid'));
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
                    setProfileOtpError(emailData.error || t('account.profilePage.profileUpdateFailed'));
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
                setSuccessMessage(t('account.profilePage.profileUpdated'));
                setIsEditing(false);
                setPendingProfileData(null);
                fetchProfile();
                setTimeout(() => setSuccessMessage(''), 5000);
            }
        } catch {
            setProfileOtpError(t('account.profilePage.genericError'));
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        form.reset();
        setIsEditing(false);
        setPendingAvatarFile(null);
    };

    const getJoinedText = (dateStr: string) => {
        const d = new Date(dateStr);
        const localeStr = locale === 'vi' ? 'vi-VN' : 'en-US';
        const weekday = d.toLocaleDateString(localeStr, { weekday: 'long' });
        const day = d.getDate();
        const month = d.getMonth() + 1;
        const year = d.getFullYear();
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        if (locale === 'vi') {
            return `${t('account.profilePage.joinedAt')} ${hours}:${minutes}, ${weekday}, ngày ${day} tháng ${month} năm ${year}`;
        }
        return `${t('account.profilePage.joinedAt')} ${hours}:${minutes}, ${weekday}, ${month}/${day}/${year}`;
    };

    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setErrorMessage(t('account.profilePage.avatarMaxSize'));
            setTimeout(() => setErrorMessage(''), 5000);
            if (avatarInputRef.current) avatarInputRef.current.value = '';
            return;
        }
        if (!file.type.startsWith('image/')) {
            setErrorMessage(t('account.profilePage.avatarInvalidFormat'));
            setTimeout(() => setErrorMessage(''), 5000);
            if (avatarInputRef.current) avatarInputRef.current.value = '';
            return;
        }
        // Open crop dialog with selected image
        const reader = new FileReader();
        reader.onload = () => {
            setAvatarCropSrc(reader.result as string);
            setAvatarCropOpen(true);
        };
        reader.readAsDataURL(file);
        if (avatarInputRef.current) avatarInputRef.current.value = '';
    };

    const handleCropConfirm = async (croppedFile: File) => {
        setAvatarCropOpen(false);
        setPendingAvatarFile(croppedFile);
        // Send OTP for avatar change verification
        setAvatarOtpSending(true);
        setAvatarOtpError('');
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
                setAvatarOtpDialogOpen(true);
                setAvatarOtp('');
            } else {
                setErrorMessage(t('account.profilePage.otpSendFailed'));
                setTimeout(() => setErrorMessage(''), 5000);
                setPendingAvatarFile(null);
            }
        } catch {
            setErrorMessage(t('account.profilePage.genericError'));
            setTimeout(() => setErrorMessage(''), 5000);
            setPendingAvatarFile(null);
        } finally {
            setAvatarOtpSending(false);
        }
    };

    const handleAvatarOtpVerify = async () => {
        if (avatarOtp.length !== 6) {
            setAvatarOtpError(t('account.profilePage.otpPlaceholder'));
            return;
        }
        if (!pendingAvatarFile) return;

        setAvatarUploading(true);
        setAvatarOtpError('');
        try {
            // Verify OTP first
            const otpRes = await fetch('/api/auth/otp', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: profile?.email,
                    otp: avatarOtp,
                }),
            });
            if (!otpRes.ok) {
                const otpData = await otpRes.json();
                setAvatarOtpError(otpData.error || t('account.profilePage.otpInvalid'));
                return;
            }

            // OTP verified — upload avatar
            const formData = new FormData();
            formData.append('avatar', pendingAvatarFile);
            const res = await fetch('/api/account/avatar', {
                method: 'POST',
                body: formData,
            });
            if (res.ok) {
                const data = await res.json();
                setProfile(prev => prev ? { ...prev, image: data.url } : prev);
                setAvatarKey(prev => prev + 1);
                setAvatarOtpDialogOpen(false);
                // Refresh next-auth session so sidebar avatar updates
                await update();
                setSuccessMessage(t('account.profilePage.avatarUpdated'));
                setTimeout(() => setSuccessMessage(''), 5000);
                setPendingAvatarFile(null);
            } else {
                setAvatarOtpError(t('account.profilePage.avatarUploadFailed'));
            }
        } catch {
            setAvatarOtpError(t('account.profilePage.genericError'));
        } finally {
            setAvatarUploading(false);
        }
    };

    const getGenderLabel = (g: string | undefined) => {
        if (g === 'male') return t('account.profilePage.genderMale');
        if (g === 'female') return t('account.profilePage.genderFemale');
        if (g === 'other') {
            const other = form.getValues('otherGender');
            return other || t('account.profilePage.genderOther');
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
                title={t('account.profilePage.pageTitle')}
                description={t('account.profilePage.pageDescription')}
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
                                            onChange={handleAvatarSelect}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => isEditing && avatarInputRef.current?.click()}
                                            disabled={avatarUploading || avatarOtpSending || !isEditing}
                                            className={cn(
                                                'relative w-[72px] h-[72px] rounded-full overflow-hidden flex-shrink-0 focus:outline-none',
                                                isEditing ? 'cursor-pointer' : 'cursor-default'
                                            )}
                                        >
                                            {profile?.image ? (
                                                <img
                                                    key={avatarKey}
                                                    src={`${profile.image}${profile.image.includes('?') ? '&' : '?'}v=${avatarKey}`}
                                                    alt="Avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-[var(--brand-color)] flex items-center justify-center text-2xl font-bold text-black/90">
                                                    {profile?.name?.charAt(0)?.toUpperCase() || session?.user?.email?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                            )}
                                            {isEditing && (
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                                                    {(avatarUploading || avatarOtpSending)
                                                        ? <Loader2 className="size-5 text-white animate-spin" />
                                                        : <Camera className="size-5 text-white" />
                                                    }
                                                </div>
                                            )}
                                        </button>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 space-y-0.5">
                                        <h1 className="text-[18px] font-semibold text-foreground">
                                            {profile?.name || t('account.profilePage.noName')}
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
                                                                label={t('account.profilePage.fullName')}
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
                                                label={t('account.profilePage.fullName')}
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
                                                                label={t('account.profilePage.phone')}
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
                                                label={t('account.profilePage.phone')}
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
                                                                label={t('account.profilePage.dateOfBirth')}
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
                                                label={t('account.profilePage.dateOfBirth')}
                                                value={form.getValues('dateOfBirth')
                                                    ? new Date(form.getValues('dateOfBirth')!).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US')
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
                                                                            {g === 'male' ? t('account.profilePage.genderMale') : g === 'female' ? t('account.profilePage.genderFemale') : t('account.profilePage.genderOther')}
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
                                                                                        label={t('account.profilePage.genderCustom')}
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
                                                label={t('account.profilePage.gender')}
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

                                {errorMessage && (
                                    <div className="flex items-center gap-3 rounded-lg border border-red-300 dark:border-red-500/30 px-4 py-3 bg-red-50 dark:bg-red-500/10 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <AlertCircle className="size-5 text-red-500 flex-shrink-0" />
                                        <p className="text-sm font-medium text-red-600 dark:text-red-400">
                                            {errorMessage}
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
                                            {t('account.profilePage.cancelButton')}
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
                                            {t('account.profilePage.saveButton')}
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
                                            {t('account.profilePage.editButton')}
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
                            {t('account.profilePage.otpTitle')}
                        </DialogTitle>
                        <DialogDescription className="text-[14px] text-muted-foreground">
                            {t('account.profilePage.otpDescription')} <span className="font-semibold text-foreground">{profile?.email}</span>
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
                                {t('account.profilePage.cancelButton')}
                            </Button>
                            <Button
                                type="button"
                                disabled={saving}
                                onClick={handleProfileOtpVerify}
                                className="font-semibold bg-[var(--brand-color)] text-black/90 border border-[var(--brand-color)] hover:bg-[var(--brand-color)]/90"
                            >
                                {saving && <Loader2 className="size-4 animate-spin mr-2" />}
                                {t('account.profilePage.confirmButton')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── Avatar Crop Dialog ── */}
            <AvatarCropDialog
                open={avatarCropOpen}
                imageSrc={avatarCropSrc}
                onClose={() => setAvatarCropOpen(false)}
                onCropComplete={handleCropConfirm}
            />

            {/* ── Avatar OTP Verification Dialog ── */}
            <Dialog open={avatarOtpDialogOpen} onOpenChange={(open) => {
                setAvatarOtpDialogOpen(open);
                if (!open) { setAvatarOtp(''); setAvatarOtpError(''); setPendingAvatarFile(null); }
            }}>
                <DialogContent className="sm:max-w-md bg-background border-border">
                    <DialogHeader>
                        <DialogTitle className="text-[18px] font-semibold">
                            {t('account.profilePage.otpAvatarTitle')}
                        </DialogTitle>
                        <DialogDescription className="text-[14px] text-muted-foreground">
                            {t('account.profilePage.otpDescription')} <span className="font-semibold text-foreground">{profile?.email}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-2">
                        <div className="flex justify-center">
                            <InputOTP
                                maxLength={6}
                                value={avatarOtp}
                                onChange={setAvatarOtp}
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

                        {avatarOtpError && (
                            <p className="text-sm text-red-500 font-medium text-center">{avatarOtpError}</p>
                        )}

                        <div className="flex gap-3 justify-end pt-1">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => { setAvatarOtpDialogOpen(false); setAvatarOtp(''); setAvatarOtpError(''); setPendingAvatarFile(null); }}
                                className="text-muted-foreground"
                            >
                                {t('account.profilePage.cancelButton')}
                            </Button>
                            <Button
                                type="button"
                                disabled={avatarUploading}
                                onClick={handleAvatarOtpVerify}
                                className="font-semibold bg-[var(--brand-color)] text-black/90 border border-[var(--brand-color)] hover:bg-[var(--brand-color)]/90"
                            >
                                {avatarUploading && <Loader2 className="size-4 animate-spin mr-2" />}
                                {t('account.profilePage.confirmButton')}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
