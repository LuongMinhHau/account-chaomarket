import Image from 'next/image';

export default function TabAuthMode() {
    return (
        <div className="flex items-center justify-center gap-4">
            <Image
                width={1920}
                height={1080}
                src="/img/brand-logo.svg"
                alt="Chao market logo"
                className="size-14 border border-border rounded-lg"
            />
            <h1 className="text-brand-text dark:text-[var(--brand-color)] text-[21px] lg:text-[25px] font-bold">
                Chào Market
            </h1>
        </div>
    );
}
