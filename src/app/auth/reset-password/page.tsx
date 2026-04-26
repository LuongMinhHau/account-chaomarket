'use client';

import { Suspense, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordWrapper() {
    return (
        <Suspense fallback={<div className="auth-container"><div className="auth-card"><div className="spinner" style={{ margin: '2rem auto' }} /></div></div>}>
            <ResetPasswordPage />
        </Suspense>
    );
}

type Step = 'email' | 'otp' | 'password' | 'success';

function ResetPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/reset-password/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setStep('otp');
            } else {
                setError('Không thể gửi mã xác minh.');
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

    const handleVerifyOtp = async () => {
        const code = otp.join('');
        if (code.length !== 6) return;

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/reset-password/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: code }),
            });

            if (res.ok) {
                setStep('password');
            } else {
                setError('Mã OTP không hợp lệ hoặc đã hết hạn.');
            }
        } catch {
            setError('Xác minh thất bại.');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Mật khẩu không khớp.');
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        if (!passwordRegex.test(password)) {
            setError('Mật khẩu cần ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/reset-password/change', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, otp: otp.join('') }),
            });

            if (res.ok) {
                setStep('success');
            } else {
                setError('Đổi mật khẩu thất bại.');
            }
        } catch {
            setError('Đã xảy ra lỗi.');
        } finally {
            setLoading(false);
        }
    };

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
                    <h1 className="auth-title" style={{ textAlign: 'center' }}>Đổi mật khẩu thành công!</h1>
                    <p style={{ color: 'var(--brand-text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                        Mật khẩu của bạn đã được cập nhật. Hãy đăng nhập lại.
                    </p>
                    <button onClick={() => router.push('/auth/login')} className="auth-btn-primary">
                        Đăng nhập
                    </button>
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

                <h1 className="auth-title">
                    {step === 'email' && 'Đặt lại mật khẩu'}
                    {step === 'otp' && 'Nhập mã xác minh'}
                    {step === 'password' && 'Mật khẩu mới'}
                </h1>

                {error && (
                    <div className="auth-error">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {step === 'email' && (
                    <form onSubmit={handleRequestOtp}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--brand-text-muted)', marginBottom: '1rem' }}>
                            Nhập email để nhận mã OTP đặt lại mật khẩu.
                        </p>
                        <div className="auth-input-group">
                            <label className="auth-label" htmlFor="resetEmail">Email</label>
                            <input
                                id="resetEmail"
                                type="email"
                                className="auth-input"
                                placeholder="name@example.com"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setError(''); }}
                                required
                                autoFocus
                            />
                        </div>
                        <button type="submit" disabled={loading} className="auth-btn-primary">
                            {loading ? <span className="spinner" /> : 'Gửi mã xác minh'}
                        </button>
                    </form>
                )}

                {step === 'otp' && (
                    <div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--brand-text-muted)', marginBottom: '0.5rem' }}>
                            Mã OTP đã gửi đến <strong style={{ color: 'var(--brand-text)' }}>{email}</strong>
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
                        <button onClick={handleVerifyOtp} disabled={loading || otp.join('').length !== 6} className="auth-btn-primary">
                            {loading ? <span className="spinner" /> : 'Xác minh'}
                        </button>
                    </div>
                )}

                {step === 'password' && (
                    <form onSubmit={handleChangePassword}>
                        <div className="auth-input-group">
                            <label className="auth-label" htmlFor="newPassword">Mật khẩu mới</label>
                            <div className="auth-input-wrapper">
                                <input
                                    id="newPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    className="auth-input"
                                    placeholder="Tối thiểu 8 ký tự"
                                    value={password}
                                    onChange={e => { setPassword(e.target.value); setError(''); }}
                                    required
                                    autoFocus
                                />
                                <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                                    {showPassword ? '👁' : '👁‍🗨'}
                                </button>
                            </div>
                        </div>
                        <div className="auth-input-group">
                            <label className="auth-label" htmlFor="confirmNewPassword">Xác nhận mật khẩu mới</label>
                            <input
                                id="confirmNewPassword"
                                type="password"
                                className="auth-input"
                                value={confirmPassword}
                                onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading} className="auth-btn-primary">
                            {loading ? <span className="spinner" /> : 'Đổi mật khẩu'}
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    <Link href="/auth/login">← Quay lại đăng nhập</Link>
                </div>
            </div>
        </div>
    );
}
