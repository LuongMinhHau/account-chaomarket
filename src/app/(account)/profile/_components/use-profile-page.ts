'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useForm, useFormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/context/i18n/context';
import { usePageTitle } from '@/hooks/use-page-title';
import { createProfileSchema, type ProfileData, type ProfileFormData } from './profile-schema';

/**
 * Custom hook encapsulating all profile page business logic.
 * Extracted from profile/page.tsx for SRP compliance.
 */
export function useProfilePage() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const { t, locale } = useI18n();
    usePageTitle('account.profile');

    // ── Profile state ──
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // ── Avatar state ──
    const [avatarUploading, setAvatarUploading] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [avatarCropSrc, setAvatarCropSrc] = useState<string>('');
    const [avatarCropOpen, setAvatarCropOpen] = useState(false);
    const [avatarKey, setAvatarKey] = useState(0);
    const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
    const [avatarOtpDialogOpen, setAvatarOtpDialogOpen] = useState(false);
    const [avatarOtp, setAvatarOtp] = useState('');
    const [avatarOtpError, setAvatarOtpError] = useState('');
    const [avatarOtpSending, setAvatarOtpSending] = useState(false);

    // ── Profile OTP state ──
    const [profileOtpDialogOpen, setProfileOtpDialogOpen] = useState(false);
    const [profileOtp, setProfileOtp] = useState('');
    const [profileOtpSending, setProfileOtpSending] = useState(false);
    const [profileOtpError, setProfileOtpError] = useState('');
    const [pendingProfileData, setPendingProfileData] = useState<ProfileFormData | null>(null);

    // ── Form ──
    const profileSchema = createProfileSchema(t);
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

    // ── Fetch profile ──
    const fetchProfile = useCallback(async () => {
        try {
            const res = await fetch('/api/account/profile');
            if (res.ok) {
                const data = await res.json();
                const user = data.user;
                setProfile(user);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    // ── Auth redirect ──
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login?callbackUrl=/profile');
            return;
        }
        if (status === 'authenticated') {
            fetchProfile();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    // ── Submit → Send OTP ──
    const onSubmit = async (data: ProfileFormData) => {
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

    // ── Verify OTP → Save profile ──
    const handleProfileOtpVerify = async () => {
        if (profileOtp.length !== 6) {
            setProfileOtpError(t('account.profilePage.otpPlaceholder'));
            return;
        }
        if (!pendingProfileData) return;

        setSaving(true);
        setProfileOtpError('');
        try {
            const otpRes = await fetch('/api/auth/otp', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: profile?.email, otp: profileOtp }),
            });
            if (!otpRes.ok) {
                const otpData = await otpRes.json();
                setProfileOtpError(otpData.error || t('account.profilePage.otpInvalid'));
                return;
            }

            const emailChanged = pendingProfileData.email.toLowerCase() !== profile?.email?.toLowerCase();
            if (emailChanged) {
                const emailRes = await fetch('/api/account/change-email', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ newEmail: pendingProfileData.email, otp: profileOtp }),
                });
                if (!emailRes.ok) {
                    const emailData = await emailRes.json();
                    setProfileOtpError(emailData.error || t('account.profilePage.profileUpdateFailed'));
                    return;
                }
            }

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

    // ── Cancel editing ──
    const handleCancel = () => {
        form.reset();
        setIsEditing(false);
        setPendingAvatarFile(null);
    };

    // ── Date formatting ──
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

    // ── Avatar selection ──
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
        const reader = new FileReader();
        reader.onload = () => {
            setAvatarCropSrc(reader.result as string);
            setAvatarCropOpen(true);
        };
        reader.readAsDataURL(file);
        if (avatarInputRef.current) avatarInputRef.current.value = '';
    };

    // ── Avatar crop confirm → Send OTP ──
    const handleCropConfirm = async (croppedFile: File) => {
        setAvatarCropOpen(false);
        setPendingAvatarFile(croppedFile);
        setAvatarOtpSending(true);
        setAvatarOtpError('');
        try {
            const res = await fetch('/api/auth/otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: profile?.email, type: 'email', purpose: 'editProfile' }),
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

    // ── Avatar OTP verify → Upload ──
    const handleAvatarOtpVerify = async () => {
        if (avatarOtp.length !== 6) {
            setAvatarOtpError(t('account.profilePage.otpPlaceholder'));
            return;
        }
        if (!pendingAvatarFile) return;

        setAvatarUploading(true);
        setAvatarOtpError('');
        try {
            const otpRes = await fetch('/api/auth/otp', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: profile?.email, otp: avatarOtp }),
            });
            if (!otpRes.ok) {
                const otpData = await otpRes.json();
                setAvatarOtpError(otpData.error || t('account.profilePage.otpInvalid'));
                return;
            }

            const formData = new FormData();
            formData.append('avatar', pendingAvatarFile);
            const res = await fetch('/api/account/avatar', { method: 'POST', body: formData });
            if (res.ok) {
                const data = await res.json();
                setProfile(prev => prev ? { ...prev, image: data.url } : prev);
                setAvatarKey(prev => prev + 1);
                setAvatarOtpDialogOpen(false);
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

    // ── Gender label ──
    const getGenderLabel = (g: string | undefined) => {
        if (g === 'male') return t('account.profilePage.genderMale');
        if (g === 'female') return t('account.profilePage.genderFemale');
        if (g === 'other') {
            const other = form.getValues('otherGender');
            return other || t('account.profilePage.genderOther');
        }
        return '';
    };

    return {
        // Session
        session, status, t, locale,
        // Profile state
        profile, loading, isEditing, setIsEditing, saving,
        successMessage, errorMessage,
        // Form
        form, isDirty, onSubmit, handleCancel,
        // Profile OTP
        profileOtpDialogOpen, setProfileOtpDialogOpen,
        profileOtp, setProfileOtp,
        profileOtpSending, profileOtpError, setProfileOtpError,
        handleProfileOtpVerify,
        // Avatar
        avatarInputRef, avatarUploading, avatarCropSrc, avatarCropOpen,
        setAvatarCropOpen, avatarKey, avatarOtpSending,
        handleAvatarSelect, handleCropConfirm,
        // Avatar OTP
        avatarOtpDialogOpen, setAvatarOtpDialogOpen,
        avatarOtp, setAvatarOtp,
        avatarOtpError, handleAvatarOtpVerify,
        setPendingAvatarFile, setAvatarOtpError,
        // Helpers
        getJoinedText, getGenderLabel,
    };
}
