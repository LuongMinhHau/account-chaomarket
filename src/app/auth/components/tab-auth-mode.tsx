import Image from 'next/image';

export default function TabAuthMode() {
    return (
        <div className="flex items-center justify-center gap-4">
            <Image
                width={1920}
                height={1080}
                src="/img/brand-logo.svg"
                alt="Chao market logo"
                className="size-[50px] border border-border rounded-lg"
            />
            <div className="flex flex-col">
                <h1 className="text-brand-text dark:text-[var(--brand-color)] text-[22px] leading-tight font-bold">
                    Chào Market
                </h1>
                <p className="text-[18px] font-semibold text-[var(--brand-grey-foreground)] dark:text-white/90">
                    Trao Giá Trị Đến Bạn
                </p>
            </div>
        </div>
    );
}
