'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { FloatingLabelInput } from '@/components/ui/floating-input';
import LoadingSpinner from '@/components/loading-spinner';
import { cn } from '@/lib/utils';
import { useI18n } from '@/context/i18n/context';

const emailSchema = z.object({
    email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
});

type EmailData = z.infer<typeof emailSchema>;

export default function ResetPasswordEmailStep({ onNext }: { onNext: (email: string) => void }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { t } = useI18n();

    const form = useForm<EmailData>({
        resolver: zodResolver(emailSchema),
        mode: 'onSubmit',
        defaultValues: { email: '' },
    });

    const onSubmit = async (data: EmailData) => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/reset-password/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: data.email }),
            });

            if (res.ok) {
                onNext(data.email);
            } else {
                const result = await res.json();
                setError(result.message || t('auth.resetPassword.requestFailed'));
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
                <div className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border border-red-500/30 dark:border-red-400/20 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-4 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.06-1.06.75.75 0 011.06 1.06zM10 8a.75.75 0 01.75.75v5a.75.75 0 01-1.5 0v-5A.75.75 0 0110 8z" clipRule="evenodd" /></svg>
                    {error}
                </div>
            )}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <FloatingLabelInput label={t('common.emailAddress')} className="app-text-input" {...field} />
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
                            'border border-black/20 dark:border-[var(--brand-grey-foreground)]/30',
                            loading ? 'disabled:bg-transparent disabled:p-0' : ''
                        )}
                    >
                        {loading ? <LoadingSpinner /> : t('auth.resetPassword.sendResetCode')}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
