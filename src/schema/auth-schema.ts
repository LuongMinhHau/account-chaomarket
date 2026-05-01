import { z } from 'zod';

export const loginSchema = z.object({
    email: z.email({ message: 'Email không hợp lệ' }),
    password: z.string().min(1, { message: 'Vui lòng nhập mật khẩu' }),
});

export const signUpSchema = z
    .object({
        firstName: z
            .string()
            .min(1, { message: 'Vui lòng nhập họ' })
            .max(50, { message: 'Họ quá dài' })
            .regex(/^[\p{L}\s'-]+$/u, { message: 'Họ không hợp lệ' }),
        lastName: z
            .string()
            .min(1, { message: 'Vui lòng nhập tên' })
            .max(50, { message: 'Tên quá dài' })
            .regex(/^[\p{L}\s'-]+$/u, { message: 'Tên không hợp lệ' }),
        email: z
            .string()
            .min(1, { message: 'Vui lòng nhập email' })
            .email({ message: 'Email không hợp lệ' })
            .max(100, { message: 'Email quá dài' }),
        password: z
            .string()
            .min(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
            .max(128, { message: 'Mật khẩu quá dài' })
            .regex(/[A-Z]/, { message: 'Cần ít nhất 1 chữ hoa' })
            .regex(/[a-z]/, { message: 'Cần ít nhất 1 chữ thường' })
            .regex(/[0-9]/, { message: 'Cần ít nhất 1 chữ số' })
            .regex(/[^A-Za-z0-9]/, { message: 'Cần ít nhất 1 ký tự đặc biệt' }),
        confirmPassword: z
            .string()
            .min(1, { message: 'Vui lòng xác nhận mật khẩu' }),
        gender: z.enum(['male', 'female', 'other']).optional(),
        otherGender: z.string().max(50).optional(),
        dateOfBirth: z.string().optional(),
        phoneNumber: z
            .string()
            .optional()
            .refine(val => !val || /^[+]?[\d\s()-]{7,20}$/.test(val), {
                message: 'Số điện thoại không hợp lệ',
            }),
    })
    .refine(data => data.password === data.confirmPassword, {
        message: 'Mật khẩu xác nhận không khớp',
        path: ['confirmPassword'],
    })
    .refine(
        data => {
            if (data.gender === 'other') {
                return !!data.otherGender && data.otherGender.trim().length > 0;
            }
            return true;
        },
        {
            message: 'Vui lòng mô tả giới tính',
            path: ['otherGender'],
        }
    );

export const otpSchema = z.object({
    email: z.email(),
    otp: z.string().length(6, 'Mã OTP phải có 6 chữ số'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;
