'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { FloatingLabelInput } from '@/components/ui/floating-input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/context/i18n/context';
import { TranslatedFormMessage } from '@/components/app-translation-message-error';


const checkoutSchema = z.object({
    firstName: z.string()
        .min(1, 'auth.validation.firstNameRequired')
        .max(50, 'validation.firstNameTooLong')
        .regex(/^[\p{L}\s'-]+$/u, 'validation.nameInvalidChars'),
    lastName: z.string()
        .min(1, 'auth.validation.lastNameRequired')
        .max(50, 'validation.lastNameTooLong')
        .regex(/^[\p{L}\s'-]+$/u, 'validation.nameInvalidChars'),
    email: z
        .string()
        .min(1, 'auth.validation.emailRequired')
        .email('validation.invalidEmail')
        .max(100, 'validation.emailTooLong'),
    phoneNumber: z.string()
        .min(1, 'validation.phoneNumberRequired')
        .regex(/^[+]?[\d\s()-]{7,20}$/, 'validation.invalidPhoneNumber'),
    message: z.string()
        .optional()
        .refine(val => !val || val.length <= 500, {
            message: 'validation.messageTooLong',
        }),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface UserProfileData {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
}

interface CheckOutTransactionFormProps {
    onSubmit: (data: CheckoutFormData) => Promise<void>;
    isDisableSubmitButton: boolean;
    initialData?: UserProfileData | null;
    submitLabel?: string;
}

export default function CheckOutTransactionForm({
    onSubmit,
    isDisableSubmitButton,
    initialData,
    submitLabel,
}: CheckOutTransactionFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { t, locale } = useI18n();

    const baseFormData = {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        message: '',
    };

    const form = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema),
        mode: 'onTouched',
        defaultValues: baseFormData,
    });

    const checkoutFormDataListener = form.watch();

    const hasFormData = Boolean(
        checkoutFormDataListener.firstName ||
        checkoutFormDataListener.lastName ||
        checkoutFormDataListener.email ||
        checkoutFormDataListener.phoneNumber ||
        checkoutFormDataListener.message
    );

    const requiredFieldsFilled = Boolean(
        checkoutFormDataListener.firstName &&
        checkoutFormDataListener.lastName &&
        checkoutFormDataListener.email &&
        checkoutFormDataListener.phoneNumber
    );

    // Always fill from profile data on load/refresh
    useEffect(() => {
        if (initialData) {
            form.reset({
                firstName: initialData.firstName || '',
                lastName: initialData.lastName || '',
                email: initialData.email || '',
                phoneNumber: initialData.phoneNumber || '',
                message: '',
            });
        }
    }, [initialData, form]);

    const handleSubmit = async (data: CheckoutFormData) => {
        setIsSubmitting(true);
        try {
            await onSubmit(data);
            form.reset(baseFormData);
        } catch (error) {
            console.error('Submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <>
            <div className="mb-6 w-full px-4">
                <div className="flex justify-end items-baseline">
                    {hasFormData && (
                        <button
                            type="button"
                            onClick={() => form.reset(baseFormData)}
                            className="text-[15px] font-normal text-[var(--brand-grey-foreground)] hover:font-semibold cursor-pointer transition-all duration-200"
                        >
                            {t('common.actions.clear')}
                        </button>
                    )}
                </div>
            </div>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-6 px-4"
                >
                    {/* First Name + Last Name */}
                    <div className="flex items-start space-x-2">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field, fieldState }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <FloatingLabelInput
                                            label={
                                                t('common.firstName') + ' ' ||
                                                'First name '
                                            }
                                            maxLength={50}
                                            {...field}
                                            className="app-text-input"
                                        />
                                    </FormControl>
                                    <TranslatedFormMessage
                                        message={fieldState.error?.message}
                                    />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field, fieldState }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <FloatingLabelInput
                                            label={
                                                t('common.lastName') + ' ' ||
                                                'Last name '
                                            }
                                            maxLength={50}
                                            {...field}
                                            className="app-text-input"
                                        />
                                    </FormControl>
                                    <TranslatedFormMessage
                                        message={fieldState.error?.message}
                                    />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Phone Number */}
                    <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormControl>
                                    <FloatingLabelInput
                                        type="tel"
                                        label={
                                            t('common.phoneNumberRequired') + ' ' ||
                                            'Phone number '
                                        }
                                        maxLength={20}
                                        {...field}
                                        className="app-text-input"
                                    />
                                </FormControl>
                                <TranslatedFormMessage
                                    message={fieldState.error?.message}
                                />
                            </FormItem>
                        )}
                    />

                    {/* Email */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormControl>
                                    <FloatingLabelInput
                                        type="email"
                                        label={
                                            t('common.email') + ' ' ||
                                            'Email '
                                        }
                                        maxLength={100}
                                        {...field}
                                        className="app-text-input"
                                    />
                                </FormControl>
                                <TranslatedFormMessage
                                    message={fieldState.error?.message}
                                />
                            </FormItem>
                        )}
                    />

                    {/* Message */}
                    <FormField
                        control={form.control}
                        name="message"
                        render={({ field, fieldState }) => {
                            const hasValue = Boolean(field.value);

                            return (
                                <FormItem>
                                    <FormControl>
                                        <div className="relative">
                                            <Textarea
                                                {...field}
                                                id={'cart-message'}
                                                maxLength={500}
                                                className="peer app-text-input focus-visible:border-ring focus-visible:ring-0 dark:bg-transparent min-h-[100px] pt-4 px-3 !text-[16px] font-medium text-foreground transition-all duration-300"
                                            />
                                            <Label
                                                htmlFor="cart-message"
                                                className={`
                                absolute start-2 z-10 origin-[0] px-2 text-[14px] text-muted-foreground duration-300 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4 cursor-text transition-all! pointer-events-none peer-focus:text-muted-foreground dark:peer-focus:text-muted-foreground peer-focus:bg-background dark:peer-focus:bg-background peer-focus:opacity-100 peer-focus:font-[550]
                                ${hasValue
                                                        ? 'top-2 -translate-y-4 scale-75 bg-background dark:bg-background opacity-100 font-[550]'
                                                        : 'top-6 -translate-y-1/2 bg-transparent opacity-75 font-normal peer-placeholder-shown:top-6 peer-placeholder-shown:-translate-y-1/2 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2'
                                                    }
                            `}
                                            >
                                                {locale === 'vi'
                                                    ? 'Ghi chú (tùy chọn)'
                                                    : 'Note (optional)'}
                                            </Label>
                                        </div>
                                    </FormControl>
                                    <TranslatedFormMessage
                                        message={fieldState.error?.message}
                                    />
                                </FormItem>
                            );
                        }}
                    />

                    {/* Hidden submit button */}
                    <input type="submit" className="hidden" />

                    <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/10 flex flex-col gap-4">
                        {/* Delivery info */}
                        <p className="text-[13px] text-left text-black/60 dark:text-white/60 leading-relaxed w-full">
                            {locale === 'vi'
                                ? <> Link sản phẩm sẽ được gửi qua email sau khi thanh toán thành công.<br />Bạn có thể theo dõi đơn hàng trong mục &quot;Lịch sử đơn hàng&quot;.</>
                                : <> Product links will be sent to your email after successful payment.<br />You can track your orders under &quot;Order History&quot;.</>}
                        </p>

                        {/* Smart hints */}
                        {requiredFieldsFilled && form.formState.isValid && isDisableSubmitButton && (
                            <p className="text-sm text-destructive font-medium text-center">
                                {locale === 'vi'
                                    ? 'Vui lòng chọn ít nhất một sản phẩm'
                                    : 'Please select at least one product'}
                            </p>
                        )}

                        <div className="flex justify-center items-center">
                            <Button
                                type="button"
                                onClick={form.handleSubmit(handleSubmit)}
                                disabled={isSubmitting || !requiredFieldsFilled || !form.formState.isValid || isDisableSubmitButton}
                                className={
                                    'font-semibold text-[16px]! h-10 px-8 min-w-[140px] border transition-all duration-300 ' +
                                    (requiredFieldsFilled && form.formState.isValid && !isDisableSubmitButton
                                        ? 'bg-[var(--brand-color)] text-black border-[var(--brand-color)] hover:bg-[var(--brand-color)]/90 hover:scale-105'
                                        : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-white border-neutral-400 dark:border-neutral-600 cursor-not-allowed opacity-100')
                                }
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        {locale === 'vi' ? 'Đang xử lý...' : 'Processing...'}
                                    </span>
                                ) : (submitLabel || (locale === 'vi' ? 'Thanh toán' : 'Checkout'))}
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </>
    );
}
