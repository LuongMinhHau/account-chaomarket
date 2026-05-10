'use client';

import { useState, Suspense, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Check, CircleX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/context/i18n/context';
import Link from 'next/link';

/* ─── Types ─── */
interface ConsultationData {
    consultationCode: number;
    solutions: { name: Record<string, string> }[];
    source: string;
    preferredDate: string;
    contactNote: string;
}

/* ─── Main Component ─── */
function ConsultationGateway() {
    const { status } = useSession();
    const _router = useRouter();
    const searchParams = useSearchParams();
    const { locale } = useI18n();

    const solutionIds = searchParams.get('solutionIds');
    const source = searchParams.get('source') || 'unknown';
    const preferredDateParam = searchParams.get('preferredDate') || '';

    // State
    const [isCreating, setIsCreating] = useState(false);
    const [_consultationData, setConsultationData] = useState<ConsultationData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [_copied, setCopied] = useState<'code' | null>(null);
    const [preferredDate, setPreferredDate] = useState(preferredDateParam);
    const [contactNote, setContactNote] = useState('');

    // Ref to prevent duplicate creation
    const consultationCreatedRef = useRef(false);

    // Mock solution names (in production these come from API)
    const mockSolutions = [
        { name: { vi: 'Giải pháp quản lý rủi ro tài chính', en: 'Financial Risk Management Solution' } },
        { name: { vi: 'Tư vấn đầu tư cá nhân hóa', en: 'Personalized Investment Advisory' } },
    ];

    // Copy helper
    const _copyToClipboard = useCallback((text: string) => {
        navigator.clipboard.writeText(text);
        setCopied('code');
        setTimeout(() => setCopied(null), 2000);
    }, []);

    // ═══ LOADING STATE ═══
    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--brand-color)] mb-6" />
                <p className="text-brand-text dark:text-white font-semibold text-[16px] mb-1">
                    {locale === 'vi' ? 'Đang tải...' : 'Loading...'}
                </p>
            </div>
        );
    }

    // ═══ CREATING STATE ═══
    if (status === 'authenticated' && isCreating) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--brand-color)] mb-6" />
                <p className="text-brand-text dark:text-white font-semibold text-[16px] mb-1">
                    {locale === 'vi' ? 'Đang Xử Lý...' : 'Processing...'}
                </p>
                <p className="text-[var(--brand-grey-foreground)] text-sm">
                    {locale === 'vi'
                        ? 'Vui lòng chờ trong giây lát.'
                        : 'Please wait a moment.'}
                </p>
            </div>
        );
    }

    // ═══ ERROR STATE ═══
    if (error) {
        return (
            <div className="flex flex-col w-full h-full">
                <div className="h-full w-full flex flex-col justify-center items-center pt-8 text-center">
                    {/* Icon — synced with confirmation page */}
                    <div className="mb-6">
                        <CircleX className="w-16 h-16 mx-auto text-red-500/80" strokeWidth={1.5} />
                    </div>
                    <p className="text-brand-text dark:text-[var(--brand-color)] font-bold text-xl mb-2">
                        {locale === 'vi' ? 'Không Thể Đặt Lịch' : 'Booking Failed'}
                    </p>
                    <p className="text-black/90 dark:text-white/90 text-[18px] font-medium mb-6 leading-relaxed">{error}</p>
                    <Button
                        onClick={() => { setError(null); consultationCreatedRef.current = false; }}
                        className="h-10 px-6 text-[16px]! font-semibold rounded-lg bg-[var(--brand-color)] text-black border border-[var(--brand-color)] dark:border-black hover:bg-[var(--brand-color)]/90 transition-all duration-300"
                    >
                        {locale === 'vi' ? 'Thử lại' : 'Try Again'}
                    </Button>
                    <button
                        onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/'}
                        className="text-[var(--brand-grey-foreground)] font-semibold hover:text-brand-text dark:hover:text-[var(--brand-color)] hover:underline transition-all cursor-pointer text-[16px] mt-4"
                    >
                        ← {locale === 'vi' ? 'Quay lại' : 'Go back'}
                    </button>
                </div>
            </div>
        );
    }

    // ═══ CONSULTATION FORM (AUTHENTICATED) ═══
    if (status === 'authenticated') {
        const solutions = mockSolutions;

        return (
            <div className="flex flex-col w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl lg:text-3xl font-bold text-brand-text dark:text-[var(--brand-color)]">
                        {locale === 'vi' ? 'Đăng Ký Tư Vấn' : 'Book Consultation'}
                    </h1>
                    <p className="text-black/90 dark:text-white/90 text-[18px] font-medium mt-2">
                        {locale === 'vi'
                            ? 'Xác nhận thông tin và thời gian mong muốn để đặt lịch tư vấn'
                            : 'Confirm your details and preferred time to schedule a consultation'}
                    </p>
                </div>

                {/* 2-column layout — same as purchase */}
                <div className="flex flex-col md:flex-row gap-6">

                    {/* LEFT: Solution summary (mirrors QR panel) */}
                    <div className="w-full md:w-[45%] rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] p-6 flex flex-col">
                        <p className="text-[13px] uppercase tracking-wider text-[var(--brand-grey-foreground)] font-medium mb-4">
                            {locale === 'vi' ? 'Gói sản phẩm đã chọn' : 'Selected solutions'}
                        </p>
                        {solutions.map((sol, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 mb-2">
                                <div className="w-5 h-5 rounded-full bg-[var(--brand-color)] flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 text-black" strokeWidth={3} />
                                </div>
                                <span className="text-[15px] font-semibold">
                                    {sol.name[locale as keyof typeof sol.name] || sol.name.vi}
                                </span>
                            </div>
                        ))}
                        <p className="text-[28px] font-bold text-brand-text dark:text-[var(--brand-color)] mt-4 text-center">
                            {locale === 'vi' ? 'Miễn phí' : 'Free'}
                        </p>
                        <p className="text-[14px] text-[var(--brand-grey-foreground)] mt-1 text-center">
                            {locale === 'vi' ? 'Tư vấn không tính phí' : 'No charge for consultation'}
                        </p>
                    </div>

                    {/* RIGHT: Consultation Info + Schedule Form */}
                    <div className="w-full md:w-[55%] flex flex-col gap-4">

                        {/* Consultation Info Card — mirrors Transaction card */}
                        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] overflow-hidden">
                            <div className="px-5 py-3 border-b border-black/5 dark:border-white/5">
                                <p className="text-[13px] uppercase tracking-wider text-[var(--brand-grey-foreground)] font-medium">
                                    {locale === 'vi' ? 'Thông tin tư vấn' : 'Consultation details'}
                                </p>
                            </div>
                            <div className="p-5 space-y-3">
                                <div className="flex items-center justify-between text-[16px]">
                                    <span className="text-[var(--brand-grey-foreground)]">
                                        {locale === 'vi' ? 'Loại yêu cầu' : 'Request type'}
                                    </span>
                                    <span className="font-semibold text-brand-text dark:text-white">
                                        {locale === 'vi' ? 'Tư vấn miễn phí' : 'Free consultation'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-[16px]">
                                    <span className="text-[var(--brand-grey-foreground)]">
                                        {locale === 'vi' ? 'Nguồn' : 'Source'}
                                    </span>
                                    <span className="font-semibold text-brand-text dark:text-white capitalize">
                                        {source === 'help' ? 'Chào Help' : source === 'trading' ? 'Chào Trading' : source}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-[16px]">
                                    <span className="text-[var(--brand-grey-foreground)]">
                                        {locale === 'vi' ? 'Số gói đã chọn' : 'Solutions selected'}
                                    </span>
                                    <span className="font-semibold text-brand-text dark:text-white">
                                        {solutions.length}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Schedule Form Card — mirrors Bank Transfer card */}
                        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] overflow-hidden">
                            <div className="px-5 py-3 border-b border-black/5 dark:border-white/5">
                                <p className="text-[13px] uppercase tracking-wider text-[var(--brand-grey-foreground)] font-medium">
                                    {locale === 'vi' ? 'Lịch hẹn' : 'Schedule'}
                                </p>
                            </div>
                            <div className="p-5 space-y-4">
                                <div>
                                    <label className="text-[14px] font-semibold block mb-1.5">
                                        {locale === 'vi' ? 'Thời gian liên hệ mong muốn' : 'Preferred contact time'}
                                    </label>
                                    <Input
                                        type="datetime-local"
                                        value={preferredDate}
                                        onChange={e => setPreferredDate(e.target.value)}
                                        className="h-11 px-4 rounded-lg border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-[15px] font-medium focus-visible:border-black/30 dark:focus-visible:border-white/30"
                                    />
                                </div>
                                <div>
                                    <label className="text-[14px] font-semibold block mb-1.5">
                                        {locale === 'vi' ? 'Ghi chú' : 'Notes'}{' '}
                                        <span className="font-normal text-[var(--brand-grey-foreground)]">
                                            ({locale === 'vi' ? 'tùy chọn' : 'optional'})
                                        </span>
                                    </label>
                                    <textarea
                                        value={contactNote}
                                        onChange={e => setContactNote(e.target.value)}
                                        placeholder={locale === 'vi' ? 'Mô tả nhu cầu tư vấn của bạn...' : 'Describe your consultation needs...'}
                                        className="w-full px-4 py-3 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-[15px] outline-none focus:border-black/30 dark:focus:border-white/30 transition-colors min-h-[100px] resize-y placeholder:text-muted-foreground"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* CTA — same style as purchase */}
                        <Button
                            onClick={() => {
                                setIsCreating(true);
                                // Demo: simulate API call
                                setTimeout(() => {
                                    setIsCreating(false);
                                    setConsultationData({
                                        consultationCode: 8472913,
                                        solutions: mockSolutions,
                                        source,
                                        preferredDate,
                                        contactNote,
                                    });
                                }, 1500);
                            }}
                            className="w-full h-12 text-[16px]! font-bold rounded-xl bg-[var(--brand-color)] text-black border border-[var(--brand-color)] dark:border-black hover:bg-[var(--brand-color)]/90 hover:scale-[1.02] transition-all duration-300"
                        >
                            {locale === 'vi' ? 'Xác Nhận Đặt Lịch' : 'Confirm Booking'}
                        </Button>

                        {/* Status — mirrors "Đang chờ thanh toán" */}
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-black dark:bg-[var(--brand-color)] animate-pulse" />
                            <p className="text-[16px] text-black dark:text-[var(--brand-color)]">
                                {locale === 'vi' ? 'Sẵn sàng gửi yêu cầu' : 'Ready to submit'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ═══ NOT AUTHENTICATED — LOGIN GATEWAY ═══
    const callbackUrl = `/consultation?solutionIds=${solutionIds || ''}&source=${source}`;

    return (
        <div className="flex flex-col w-full h-full">
            <div className="h-full w-full flex flex-col justify-center pt-8">

                {/* Notification */}
                <p className="text-[18px] text-black/90 dark:text-white/90 font-medium leading-relaxed mt-6 mx-auto w-fit">
                    {locale === 'vi'
                        ? <>
                            {solutionIds
                                ? <>Bạn đang đăng ký tư vấn từ <strong className="text-black dark:text-[var(--brand-color)]">{source === 'help' ? 'Chào Help' : source === 'trading' ? 'Chào Trading' : source}</strong>.<br />Cần xác thực tài khoản để tiếp tục đặt lịch.</>
                                : <>Cần xác thực tài khoản để tiếp tục đặt lịch.</>}
                          </>
                        : <>
                            {solutionIds
                                ? <>You are booking a consultation from <strong className="text-black dark:text-[var(--brand-color)]">{source === 'help' ? 'Chào Help' : source === 'trading' ? 'Chào Trading' : source}</strong>.<br />Account verification is required to proceed.</>
                                : <>Account verification is required to proceed.</>}
                          </>}
                </p>

                {/* Primary CTA */}
                <Button
                    asChild
                    className="w-fit mx-auto h-12 bg-[var(--brand-color)] cursor-pointer text-black font-bold px-12 rounded-3xl hover:bg-[var(--brand-color-foreground)] transition-colors! duration-300 ease-in-out text-[16px]! border border-black/20 dark:border-[var(--brand-grey-foreground)]/30 mt-8"
                >
                    <Link href={`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
                        {locale === 'vi' ? 'Đăng nhập' : 'Sign In'}
                    </Link>
                </Button>

                {/* Sign up link + Back */}
                <div className="text-center text-[16px] font-medium flex flex-col gap-3 mt-4">
                    <div className="flex gap-2 justify-center items-center">
                        {locale === 'vi' ? 'Chưa có tài khoản?' : "Don't have an account?"}{' '}
                        <Link
                            href={`/auth/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                            className="dark:text-[var(--brand-color)] text-black font-bold hover:font-extrabold dark:hover:text-[var(--brand-color-foreground)] transition-all! duration-300 ease-in-out"
                        >
                            {locale === 'vi' ? 'Đăng Ký' : 'Sign Up'}
                        </Link>
                    </div>
                    <button
                        onClick={() => window.history.length > 1 ? window.history.back() : window.location.href = '/'}
                        className="text-[var(--brand-grey-foreground)] font-semibold hover:text-brand-text dark:hover:text-[var(--brand-color)] hover:underline transition-all cursor-pointer"
                    >
                        ← {locale === 'vi' ? 'Quay lại' : 'Go back'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ConsultationGatewayWrapper() {
    return (
        <Suspense
            fallback={
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-color)]" />
                </div>
            }
        >
            <ConsultationGateway />
        </Suspense>
    );
}
