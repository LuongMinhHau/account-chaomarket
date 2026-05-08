'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { FloatingLabelInput } from '@/components/ui/floating-input';
import LoadingSpinner from '@/components/loading-spinner';
import { cn } from '@/lib/utils';
import { useI18n } from '@/context/i18n/context';

const newPasswordSchema = z.object({
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'At least 1 uppercase letter required')
        .regex(/[a-z]/, 'At least 1 lowercase letter required')
        .regex(/[0-9]/, 'At least 1 digit required')
        .regex(/[^A-Za-z0-9]/, 'At least 1 special character required'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

type NewPasswordData = z.infer<typeof newPasswordSchema>;

export default function ResetPasswordNewPasswordStep({
    email,
    otp,
    onComplete,
}: {
    email: string;
    otp: string;
    onBack: () => void;
    onComplete: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { t } = useI18n();

    const form = useForm<NewPasswordData>({
        resolver: zodResolver(newPasswordSchema),
        mode: 'onSubmit',
        defaultValues: { password: '', confirmPassword: '' },
    });

    const onSubmit = async (data: NewPasswordData) => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/reset-password/change', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: data.password, otp }),
            });

            if (res.ok) {
                onComplete();
            } else {
                const result = await res.json();
                setError(result.message || t('auth.resetPassword.updateFailed'));
            }
        } catch {
            setError(t('auth.loginError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            {error && (
                <div className="flex items-center gap-2 text-sm font-medium px-3 py-2 mb-2 rounded-lg border border-red-500/30 dark:border-red-400/20 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.06-1.06.75.75 0 011.06 1.06zM10 8a.75.75 0 01.75.75v5a.75.75 0 01-1.5 0v-5A.75.75 0 0110 8z" clipRule="evenodd" /></svg>
                    {error}
                </div>
            )}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                                {t('common.newPassword')}
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
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <FloatingLabelInput
                                        type="password"
                                        label={t('common.confirmNewPassword')}
                                        className="app-text-input"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        disabled={loading}
                        className={cn(
                            'w-full bg-[var(--brand-color)] cursor-pointer text-black font-bold py-2 px-4 rounded-3xl',
                            'hover:bg-[var(--brand-color-foreground)] transition-colors! duration-300 ease-in-out text-[18px]!',
                            'border border-black/20 dark:border-[var(--brand-grey-foreground)]/30 h-12',
                            loading ? 'disabled:bg-transparent disabled:p-0' : ''
                        )}
                    >
                        {loading ? <LoadingSpinner /> : t('auth.resetPassword.updatePassword')}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
