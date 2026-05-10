'use client';

import Image from 'next/image';
import { Pencil, Loader2, CheckCircle2, Calendar, Mail, Camera, AlertCircle } from 'lucide-react';
import AvatarCropDialog from '@/components/avatar-crop-dialog';
import { BirthDatePicker } from '@/components/birth-date-picker';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
import LoadingSpinner from '@/components/loading-spinner';
import PageHeader from '@/components/page-header';
import OtpVerificationDialog from './_components/otp-verification-dialog';
import ReadOnlyField from './_components/read-only-field';
import { useProfilePage } from './_components/use-profile-page';


export default function ProfilePage() {
    const {
        session, status, t, locale,
        profile, loading, isEditing, setIsEditing, saving,
        successMessage, errorMessage,
        form, isDirty, onSubmit, handleCancel,
        profileOtpDialogOpen, setProfileOtpDialogOpen,
        profileOtp, setProfileOtp,
        profileOtpSending, profileOtpError, setProfileOtpError,
        handleProfileOtpVerify,
        avatarInputRef, avatarUploading, avatarCropSrc, avatarCropOpen,
        setAvatarCropOpen, avatarKey, avatarOtpSending,
        handleAvatarSelect, handleCropConfirm,
        avatarOtpDialogOpen, setAvatarOtpDialogOpen,
        avatarOtp, setAvatarOtp,
        avatarOtpError, handleAvatarOtpVerify,
        setPendingAvatarFile, setAvatarOtpError,
        getJoinedText, getGenderLabel,
    } = useProfilePage();

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
                                                <Image
                                                    key={avatarKey}
                                                    src={`${profile.image}${profile.image.includes('?') ? '&' : '?'}v=${avatarKey}`}
                                                    alt="Avatar"
                                                    width={72}
                                                    height={72}
                                                    className="w-full h-full object-cover"
                                                    unoptimized
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
            <OtpVerificationDialog
                open={profileOtpDialogOpen}
                onOpenChange={(open) => {
                    setProfileOtpDialogOpen(open);
                    if (!open) { setProfileOtp(''); setProfileOtpError(''); }
                }}
                title={t('account.profilePage.otpTitle')}
                email={profile?.email || ''}
                otp={profileOtp}
                onOtpChange={setProfileOtp}
                error={profileOtpError}
                loading={saving}
                onVerify={handleProfileOtpVerify}
                onCancel={() => { setProfileOtpDialogOpen(false); setProfileOtp(''); setProfileOtpError(''); }}
            />

            {/* ── Avatar Crop Dialog ── */}
            <AvatarCropDialog
                open={avatarCropOpen}
                imageSrc={avatarCropSrc}
                onClose={() => setAvatarCropOpen(false)}
                onCropComplete={handleCropConfirm}
            />

            {/* ── Avatar OTP Verification Dialog ── */}
            <OtpVerificationDialog
                open={avatarOtpDialogOpen}
                onOpenChange={(open) => {
                    setAvatarOtpDialogOpen(open);
                    if (!open) { setAvatarOtp(''); setAvatarOtpError(''); setPendingAvatarFile(null); }
                }}
                title={t('account.profilePage.otpAvatarTitle')}
                email={profile?.email || ''}
                otp={avatarOtp}
                onOtpChange={setAvatarOtp}
                error={avatarOtpError}
                loading={avatarUploading}
                onVerify={handleAvatarOtpVerify}
                onCancel={() => { setAvatarOtpDialogOpen(false); setAvatarOtp(''); setAvatarOtpError(''); setPendingAvatarFile(null); }}
            />
        </div>
    );
}
