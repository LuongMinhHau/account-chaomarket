'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import isEqual from 'lodash/isEqual';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import LoadingSpinner from '@/components/loading-spinner';
import TabAuthMode from '@/app/auth/components/tab-auth-mode';
import SocialLogin from '@/app/auth/components/social-login';
import { FloatingLabelInput } from '@/components/ui/floating-input';
import { signUpSchema, type SignUpFormData } from '@/schema/auth-schema';
import { BirthDatePicker } from '@/components/birth-date-picker';
import type { OtpVerificationFormProps } from '@/app/auth/components/otp-verification-form';
import { cn } from '@/lib/utils';
import { useI18n } from '@/context/i18n/context';

const SESSION_FORM_SIGN_UP = 'chao_account_signup_form';

interface SignUpFormProps {
    onSignUpSuccess: (user: OtpVerificationFormProps) => void;
}

export function SignUpForm({ onSignUpSuccess }: SignUpFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const searchParams = useSearchParams();
    const { t } = useI18n();

    const baseFormData: SignUpFormData = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        gender: undefined,
        otherGender: '',
        dateOfBirth: '',
        phoneNumber: '',
    };

    const form = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
        mode: 'onSubmit',
        reValidateMode: 'onSubmit',
        defaultValues: baseFormData,
    });

    const formDataListener = form.watch();
    const genderValue = form.watch('gender');

    const onSubmit = async (data: SignUpFormData) => {
        setLoading(true);
        setError('');
        setSuccess('');

        if (!termsAccepted) {
            setError(t('auth.termsNotAccepted'));
            setLoading(false);
            return;
        }

        try {
            const fullName = `${data.firstName} ${data.lastName}`;
            const genderVal = data.gender === 'other' ? data.otherGender : data.gender;

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: fullName,
                    email: data.email,
                    password: data.password,
                    gender: genderVal,
                    dateOfBirth: data.dateOfBirth || undefined,
                    phoneNumber: data.phoneNumber || undefined,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                removeFromSessionStorage();
                setSuccess(t('auth.signupSuccessMessage'));
                // Send OTP
                await fetch('/api/auth/otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: data.email, type: 'email' }),
                });
                onSignUpSuccess({
                    email: data.email,
                    firstName: data.firstName,
                });
            } else {
                setError(result.error || t('auth.registrationFailed'));
            }
        } catch {
            setError(t('auth.registrationError'));
        } finally {
            setLoading(false);
        }
    };

    // Session storage persistence
    const setToSessionStorage = (formData: SignUpFormData) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, confirmPassword, ...nonSensitive } = formData;
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(SESSION_FORM_SIGN_UP, JSON.stringify(nonSensitive));
        }
    };

    const extractFromSessionStorage = (): Partial<SignUpFormData> => {
        if (typeof sessionStorage !== 'undefined') {
            const storedValue = sessionStorage.getItem(SESSION_FORM_SIGN_UP);
            if (storedValue) {
                const parsed = JSON.parse(storedValue);
                return { ...parsed, password: '', confirmPassword: '' };
            }
        }
        return baseFormData;
    };

    const removeFromSessionStorage = () =>
        sessionStorage.removeItem(SESSION_FORM_SIGN_UP);

    useEffect(() => {
        if (!isEqual(formDataListener, baseFormData))
            setToSessionStorage(formDataListener);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formDataListener]);

    useEffect(() => {
        if (typeof sessionStorage !== 'undefined') {
            const storedValue = extractFromSessionStorage();
            form.reset(storedValue);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const hasFormData = formDataListener.firstName || formDataListener.lastName || formDataListener.email || formDataListener.password || formDataListener.confirmPassword || formDataListener.gender || formDataListener.dateOfBirth || formDataListener.phoneNumber;

    return (
        <div className="flex flex-col w-full h-full [&_*_h2]:text-[20px] [&_*_h2]:font-extrabold [&_*_h2]:text-black/90 dark:[&_*_h2]:text-brand-text">
            <div className="h-fit">
                <TabAuthMode />
                <div className="mt-6 w-full flex justify-between items-baseline pr-2">
                    <h2>{t('auth.createAccountTitle')}</h2>
                    {hasFormData && (
                        <button
                            type="button"
                            onClick={() => {
                                form.reset(baseFormData);
                                setTermsAccepted(false);
                                setError('');
                                setSuccess('');
                                removeFromSessionStorage();
                            }}
                            className="text-[15px] font-semibold text-[var(--brand-grey-foreground)] opacity-60 hover:opacity-100 dark:hover:text-[var(--brand-color)] hover:text-black cursor-pointer transition-all duration-200"
                        >
                            {t('common.actions.clear')}
                        </button>
                    )}
                </div>
            </div>

            <div className="h-full w-full flex flex-col pt-2">
                {error && (
                    <div className="flex items-center gap-2 text-sm font-medium px-3 py-2 mb-2 rounded-lg border border-red-500/30 dark:border-red-400/20 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.06-1.06.75.75 0 011.06 1.06zM10 8a.75.75 0 01.75.75v5a.75.75 0 01-1.5 0v-5A.75.75 0 0110 8z" clipRule="evenodd" /></svg>
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        {success}
                    </div>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="h-fit space-y-5">
                        <div className="lg:max-h-[30rem] px-2 overflow-y-auto py-1 space-y-5">
                            {/* Name row */}
                            <div className="flex space-x-2">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <FloatingLabelInput label={t('common.firstName')} className="app-text-input" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <FloatingLabelInput label={t('common.lastName')} className="app-text-input" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Gender */}
                            <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                    <FormItem className="space-y-1">
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value || ''}
                                                className="flex items-center flex-wrap"
                                            >
                                                {(['male', 'female', 'other'] as const).map(g => (
                                                    <FormItem key={g} className="flex items-center space-x-1 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem
                                                                className="data-[state=checked]:border-brand-text dark:data-[state=checked]:border-[var(--brand-color)] cursor-pointer dark:[&_*_svg]:fill-[var(--brand-color)] dark:[&_*_svg]:stroke-[var(--brand-color)]"
                                                                value={g}
                                                                aria-invalid="false"
                                                                onClick={() => {
                                                                    if (field.value === g) field.onChange(undefined);
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormLabel
                                                            className={cn(
                                                                'font-semibold transition-colors! text-[12px] lg:text-[14px]',
                                                                genderValue === g
                                                                    ? 'text-brand-text dark:text-[var(--brand-color)]'
                                                                    : 'text-[var(--brand-grey-foreground)]/50'
                                                            )}
                                                            aria-invalid="false"
                                                        >
                                                            {g === 'male' ? t('common.gender.male') : g === 'female' ? t('common.gender.female') : t('common.gender.other')}
                                                        </FormLabel>
                                                    </FormItem>
                                                ))}

                                                <FormField
                                                    control={form.control}
                                                    name="otherGender"
                                                    disabled={genderValue !== 'other'}
                                                    render={({ field: otherField }) => (
                                                        <FormItem className="ml-4 flex-1 min-w-[150px]">
                                                            <FormControl>
                                                                <FloatingLabelInput
                                                                    label={t('common.gender.selfDescribe')}
                                                                    className="app-text-input disabled:opacity-100! disabled:text-muted-foreground [&+label]:opacity-100!"
                                                                    {...otherField}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </RadioGroup>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Date of Birth + Phone */}
                            <div className="grid grid-cols-[minmax(180px,auto)_1fr] gap-4 items-start">
                                <FormField
                                    control={form.control}
                                    name="dateOfBirth"
                                    render={({ field }) => (
                                        <FormItem className="shrink-0">
                                            <FormControl>
                                                <BirthDatePicker
                                                    onDateChange={field.onChange}
                                                    buttonClass="w-full dark:bg-transparent dark:hover:bg-transparent"
                                                    label={t('common.dateOfBirthRequired')}
                                                    isFloatingLabel={true}
                                                    isMarginVisible={false}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phoneNumber"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <FloatingLabelInput label={t('common.phoneNumber')} className="app-text-input" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Email */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <FloatingLabelInput type="email" label={t('common.emailAddress')} className="app-text-input" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Password */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <FloatingLabelInput
                                                type={showPassword ? 'text' : 'password'}
                                                label={
                                                    <span className="inline-flex items-center gap-1">
                                                        {t('common.password')}
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="pointer-events-auto cursor-pointer inline-flex items-center"
                                                        >
                                                            {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                                        </button>
                                                    </span>
                                                }
                                                className="app-text-input"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Confirm Password */}
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <FloatingLabelInput
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                label={
                                                    <span className="inline-flex items-center gap-1">
                                                        {t('common.confirmPassword')}
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
                                                autoComplete="new-password"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Terms */}
                        <div className="flex items-start space-x-3 mt-4">
                            <RadioGroup
                                value={String(termsAccepted)}
                                onValueChange={value => {
                                    setTermsAccepted(Boolean(value));
                                    if (Boolean(value) && error === 'Vui lòng đồng ý với điều khoản sử dụng.') {
                                        setError('');
                                    }
                                }}
                                className="mt-1"
                            >
                                <RadioGroupItem
                                    value="true"
                                    id="terms"
                                    className="cursor-pointer"
                                    onClick={() => {
                                        if (termsAccepted) setTermsAccepted(false);
                                    }}
                                />
                            </RadioGroup>
                            <label
                                htmlFor="terms"
                                className="text-[13px] lg:text-[15px] cursor-pointer text-[var(--brand-grey-foreground)] dark:text-white"
                            >
                                Bằng việc tạo tài khoản, tôi xác nhận mình{' '}
                                <span className="font-bold">{t('auth.termsAgreement.startAgePrivacy')}</span> {t('auth.termsAgreement.startEndContent')}
                                {' '}{t('auth.termsAgreement.startNewLine')}{' '}
                                <Link className="dark:text-[var(--brand-color)] text-brand-text font-bold hover:underline" href="https://policy.chaomarket.com/terms-of-use" target="_blank" rel="noopener">
                                    {t('auth.termsAgreement.termsOfUse')}
                                </Link>{' '}
                                {t('auth.termsAgreement.and')}{' '}
                                <Link href="https://policy.chaomarket.com/privacy-policy" target="_blank" rel="noopener" className="dark:text-[var(--brand-color)] text-black font-bold hover:underline">
                                    {t('auth.termsAgreement.privacyNotice')}
                                </Link>
                            </label>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                'w-full bg-[var(--brand-color)] cursor-pointer text-black font-bold py-3',
                                'px-6 rounded-3xl disabled:p-0 mt-2 hover:bg-[var(--brand-color-foreground)]',
                                'transition-colors! duration-300 ease-in-out text-[16px]!',
                                'border border-black/20 dark:border-[var(--brand-grey-foreground)]/30 h-12',
                                loading ? 'disabled:bg-transparent' : ''
                            )}
                        >
                            {loading ? <LoadingSpinner /> : t('auth.signup')}
                        </Button>
                    </form>
                </Form>
                <div className="text-center mt-2">
                    <SocialLogin />
                    <div className="text-[18px] text-brand-text font-medium flex gap-2 justify-center items-center">
                        {t('auth.alreadyHaveAccount')}{' '}
                        <Link
                            href={`/auth/login${searchParams.get('callbackUrl') ? `?callbackUrl=${encodeURIComponent(searchParams.get('callbackUrl')!)}` : ''}`}
                            className="dark:text-[var(--brand-color)] font-semibold text-black hover:underline"
                        >
                            {t('auth.login')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
