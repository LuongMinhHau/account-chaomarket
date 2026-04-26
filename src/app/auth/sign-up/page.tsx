'use client';

import { Suspense, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPageWrapper() {
    return (
        <Suspense fallback={<div className="auth-container"><div className="auth-card"><div className="spinner" style={{ margin: '2rem auto' }} /></div></div>}>
            <SignUpPage />
        </Suspense>
    );
}

function SignUpPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        gender: '',
        dateOfBirth: '',
        phoneNumber: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    const updateForm = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (error) setError('');
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            setError('Mật khẩu không khớp.');
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!passwordRegex.test(form.password)) {
            setError('Mật khẩu cần ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                    name: `${form.firstName} ${form.lastName}`.trim(),
                    gender: form.gender || 'other',
                    dateOfBirth: form.dateOfBirth || null,
                    phoneNumber: form.phoneNumber || null,
                }),
            });

            if (res.ok) {
                // Send OTP for email verification
                await fetch('/api/auth/otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: form.email }),
                });
                setStep('otp');
            } else {
                const data = await res.json();
                setError(data.error || 'Đăng ký thất bại.');
            }
        } catch {
            setError('Đã xảy ra lỗi.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpVerify = async () => {
        const code = otp.join('');
        if (code.length !== 6) return;

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/otp', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email, otp: code }),
            });

            if (res.ok) {
                setStep('success');
            } else {
                setError('Mã OTP không hợp lệ hoặc đã hết hạn.');
            }
        } catch {
            setError('Xác minh thất bại.');
        } finally {
            setLoading(false);
        }
    };

    const loginUrl = `/auth/login${searchParams.get('callbackUrl') ? `?callbackUrl=${encodeURIComponent(searchParams.get('callbackUrl')!)}` : ''}`;

    if (step === 'success') {
        return (
            <div className="auth-container">
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <div className="brand-header" style={{ justifyContent: 'center' }}>
                        <div className="brand-logo">C</div>
                    </div>
                    <div className="success-check">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <h1 className="auth-title" style={{ textAlign: 'center' }}>Đăng ký thành công!</h1>
                    <p style={{ color: 'var(--brand-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                        Tài khoản của bạn đã được tạo và xác minh thành công.
                    </p>
                    <Link href={loginUrl}>
                        <button className="auth-btn-primary">Đăng nhập ngay</button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="brand-header">
                    <div className="brand-logo">C</div>
                    <div>
                        <div className="brand-name">Chào Market</div>
                        <div className="brand-slogan">Quản Lý Rủi Ro Của Bạn</div>
                    </div>
                </div>

                <div className="auth-tabs">
                    <Link href={loginUrl} className="auth-tab">Đăng nhập</Link>
                    <span className="auth-tab active">Đăng ký</span>
                </div>

                <h1 className="auth-title">Tạo tài khoản mới</h1>

                {error && (
                    <div className="auth-error">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {step === 'otp' ? (
                    <div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--brand-text-muted)', marginBottom: '0.5rem' }}>
                            Mã xác minh đã gửi đến <strong style={{ color: 'var(--brand-text)' }}>{form.email}</strong>
                        </p>
                        <div className="otp-container">
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={el => { otpRefs.current[i] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => handleOtpChange(i, e.target.value)}
                                    onKeyDown={e => handleOtpKeyDown(i, e)}
                                    className="otp-digit"
                                    autoFocus={i === 0}
                                />
                            ))}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--brand-text-muted)', textAlign: 'center', marginBottom: '1rem' }}>
                            Mã hết hạn sau 10 phút
                        </p>
                        <button onClick={handleOtpVerify} disabled={loading || otp.join('').length !== 6} className="auth-btn-primary">
                            {loading ? <span className="spinner" /> : 'Xác minh'}
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleRegister}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div className="auth-input-group">
                                <label className="auth-label" htmlFor="firstName">Họ</label>
                                <input id="firstName" className="auth-input" value={form.firstName} onChange={e => updateForm('firstName', e.target.value)} required autoFocus />
                            </div>
                            <div className="auth-input-group">
                                <label className="auth-label" htmlFor="lastName">Tên</label>
                                <input id="lastName" className="auth-input" value={form.lastName} onChange={e => updateForm('lastName', e.target.value)} required />
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label className="auth-label" htmlFor="signupEmail">Email</label>
                            <input id="signupEmail" type="email" className="auth-input" placeholder="name@example.com" value={form.email} onChange={e => updateForm('email', e.target.value)} required />
                        </div>

                        <div className="auth-input-group">
                            <label className="auth-label" htmlFor="signupPassword">Mật khẩu</label>
                            <div className="auth-input-wrapper">
                                <input id="signupPassword" type={showPassword ? 'text' : 'password'} className="auth-input" placeholder="Tối thiểu 8 ký tự" value={form.password} onChange={e => updateForm('password', e.target.value)} required />
                                <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                                    {showPassword ? '👁' : '👁‍🗨'}
                                </button>
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label className="auth-label" htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                            <input id="confirmPassword" type="password" className="auth-input" value={form.confirmPassword} onChange={e => updateForm('confirmPassword', e.target.value)} required />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div className="auth-input-group">
                                <label className="auth-label" htmlFor="gender">Giới tính</label>
                                <select id="gender" className="auth-select" value={form.gender} onChange={e => updateForm('gender', e.target.value)}>
                                    <option value="">Chọn</option>
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>
                            <div className="auth-input-group">
                                <label className="auth-label" htmlFor="dob">Ngày sinh</label>
                                <input id="dob" type="date" className="auth-input" value={form.dateOfBirth} onChange={e => updateForm('dateOfBirth', e.target.value)} />
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label className="auth-label" htmlFor="phone">Số điện thoại (tùy chọn)</label>
                            <input id="phone" type="tel" className="auth-input" placeholder="+84..." value={form.phoneNumber} onChange={e => updateForm('phoneNumber', e.target.value)} />
                        </div>

                        <button type="submit" disabled={loading} className="auth-btn-primary" style={{ marginTop: '0.5rem' }}>
                            {loading ? <span className="spinner" /> : 'Đăng ký'}
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    Đã có tài khoản?{' '}
                    <Link href={loginUrl}>Đăng nhập</Link>
                </div>
            </div>
        </div>
    );
}
