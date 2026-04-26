'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPageWrapper() {
    return (
        <Suspense fallback={<div className="auth-container"><div className="auth-card"><div className="spinner" style={{ margin: '2rem auto' }} /></div></div>}>
            <LoginPage />
        </Suspense>
    );
}

function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [needsOtp, setNeedsOtp] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Clear error on input change
    useEffect(() => {
        if (error) setError('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [email, password]);

    // Check for OAuth errors
    useEffect(() => {
        const err = searchParams.get('error');
        if (err === 'OAuthAccountNotLinked')
            setError('Email này đã liên kết với phương thức đăng nhập khác.');
        else if (err === 'CredentialsSignin')
            setError('Thông tin đăng nhập không hợp lệ.');
        else if (err === 'AccessDenied')
            setError('Truy cập bị từ chối.');
    }, [searchParams]);

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setLoading(true);
        setError('');

        try {
            // Check email verification status
            const verifyRes = await fetch(`/api/user/verify?email=${encodeURIComponent(email)}`);
            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.data?.emailVerified) {
                // Email verified → login directly
                const result = await signIn('credentials', {
                    email,
                    password,
                    redirect: false,
                });

                if (!result?.ok) {
                    setError('Thông tin đăng nhập không hợp lệ.');
                } else {
                    const callbackUrl = searchParams.get('callbackUrl') || 'https://finance.chaomarket.com/home';
                    window.location.replace(callbackUrl);
                    return;
                }
            } else {
                // Email not verified → send OTP
                await fetch('/api/auth/otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });
                setNeedsOtp(true);
            }
        } catch {
            setError('Đã xảy ra lỗi khi đăng nhập.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
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
                body: JSON.stringify({ email, otp: code }),
            });

            if (res.ok) {
                // OTP verified, now login
                const result = await signIn('credentials', {
                    email,
                    password,
                    redirect: false,
                });

                if (result?.ok) {
                    const callbackUrl = searchParams.get('callbackUrl') || 'https://finance.chaomarket.com/home';
                    window.location.replace(callbackUrl);
                    return;
                } else {
                    setError('Thông tin đăng nhập không hợp lệ.');
                    setNeedsOtp(false);
                }
            } else {
                setError('Mã OTP không hợp lệ hoặc đã hết hạn.');
            }
        } catch {
            setError('Xác minh OTP thất bại.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        const callbackUrl = searchParams.get('callbackUrl') || 'https://finance.chaomarket.com/home';
        signIn('google', { callbackUrl });
    };

    const signupUrl = `/auth/sign-up${searchParams.get('callbackUrl') ? `?callbackUrl=${encodeURIComponent(searchParams.get('callbackUrl')!)}` : ''}`;

    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* Brand Header */}
                <div className="brand-header">
                    <div className="brand-logo">C</div>
                    <div>
                        <div className="brand-name">Chào Market</div>
                        <div className="brand-slogan">Quản Lý Rủi Ro Của Bạn</div>
                    </div>
                </div>

                {/* Tab Mode */}
                <div className="auth-tabs">
                    <span className="auth-tab active">Đăng nhập</span>
                    <Link href={signupUrl} className="auth-tab">Đăng ký</Link>
                </div>

                <h1 className="auth-title">Chào mừng trở lại!</h1>

                {/* Error */}
                {error && (
                    <div className="auth-error">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {needsOtp ? (
                    /* OTP Verification */
                    <div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--brand-text-muted)', marginBottom: '0.5rem' }}>
                            Mã xác minh đã gửi đến <strong style={{ color: 'var(--brand-text)' }}>{email}</strong>
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

                        <button
                            onClick={handleOtpVerify}
                            disabled={loading || otp.join('').length !== 6}
                            className="auth-btn-primary"
                        >
                            {loading ? <span className="spinner" /> : 'Xác minh'}
                        </button>
                    </div>
                ) : (
                    /* Login Form */
                    <form onSubmit={handleCredentialsLogin}>
                        <div className="auth-input-group">
                            <label className="auth-label" htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                className="auth-input"
                                placeholder="name@example.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="auth-input-group">
                            <label className="auth-label" htmlFor="password">Mật khẩu</label>
                            <div className="auth-input-wrapper">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="auth-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button type="button" className="auth-forgot" onClick={() => router.push('/auth/reset-password')}>
                            Quên mật khẩu?
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="auth-btn-primary"
                            style={{ marginTop: '1rem' }}
                        >
                            {loading ? <span className="spinner" /> : 'Đăng nhập'}
                        </button>
                    </form>
                )}

                {/* Social Login */}
                {!needsOtp && (
                    <>
                        <div className="auth-divider">
                            <span>hoặc tiếp tục với</span>
                        </div>

                        <button onClick={handleGoogleLogin} className="auth-btn-social">
                            <svg width="20" height="20" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Đăng nhập với Google
                        </button>
                    </>
                )}

                {/* Footer */}
                <div className="auth-footer">
                    Chưa có tài khoản?{' '}
                    <Link href={signupUrl}>Đăng ký ngay</Link>
                </div>
            </div>
        </div>
    );
}
