import { Home, Search } from 'lucide-react';
import Link from 'next/link';

/**
 * Custom 404 page — displayed when user navigates to non-existent route.
 */
export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <div className="mb-6">
                <div className="w-20 h-20 rounded-full bg-black/[0.05] dark:bg-white/[0.06] flex items-center justify-center mx-auto">
                    <Search className="w-8 h-8 text-black/40 dark:text-white/40" strokeWidth={1.5} />
                </div>
            </div>

            <h1 className="text-4xl font-bold text-brand-text dark:text-[var(--brand-color)] mb-2">
                404
            </h1>
            <h2 className="text-lg font-semibold text-black/80 dark:text-white/80 mb-2">
                Không tìm thấy trang
            </h2>
            <p className="text-black/50 dark:text-white/50 text-[15px] max-w-md mb-8 leading-relaxed">
                Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
            </p>

            <Link
                href="/profile"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-[14px] font-semibold bg-[var(--brand-color)] text-black border border-[var(--brand-color)] hover:bg-[var(--brand-color)]/90 transition-all duration-300"
            >
                <Home className="size-4" />
                Về trang chủ
            </Link>
        </div>
    );
}
