'use client';

import {
    Clock,
    Handshake,
    Mail,
    Users,
    Phone,
    MessageCircle,
    HelpCircle,
    Building,
    Globe,
    HeadphonesIcon,
} from 'lucide-react';
import { useI18n } from '@/context/i18n/context';
import { sanitizeHtml } from '@/lib/sanitize';

// ── Icon mapping ──
const ICON_MAP: Record<
    string,
    React.ComponentType<{ size?: number; className?: string }>
> = {
    Users,
    Handshake,
    Mail,
    Clock,
    Phone,
    MessageCircle,
    HelpCircle,
    Building,
    Globe,
    HeadphonesIcon,
};

export interface ContactCard {
    icon: string;
    titleEn: string;
    titleVi: string;
    descEn: string;
    descVi: string;
    email: string;
    visible?: boolean;
}

interface ContactContentProps {
    headingEn: string;
    headingVi: string;
    cards: ContactCard[];
}

export default function ContactContent({
    headingEn,
    headingVi,
    cards,
}: ContactContentProps) {
    const { locale } = useI18n();
    const isVi = locale === 'vi';

    const heading = isVi ? headingVi : headingEn;

    return (
        <div className="w-full h-full">
            <p className="font-semibold text-xl lg:text-2xl mb-4">{heading}</p>
            <div className='flex flex-col lg:flex-row dark:[&>div[data-slot="Card"]]:bg-[var(--brand-black-bg)] [&>div[data-slot="Card"]]:bg-[var(--brand-grey)] [&>div[data-slot="Card"]]:px-8 [&>div[data-slot="Card"]]:shadow-sm [&>div[data-slot="Card"]]:py-10 [&>div[data-slot="Card"]]:rounded-2xl gap-2'>
                {cards.map((card, index) => {
                    const IconComp = ICON_MAP[card.icon] || Mail;
                    const title = isVi ? card.titleVi : card.titleEn;
                    const desc = isVi ? card.descVi : card.descEn;
                    return (
                        <div
                            key={index}
                            data-slot="Card"
                            className="flex basis-1/4 flex-col justify-center gap-2"
                        >
                            <IconComp
                                size={60}
                                className="dark:text-[var(--brand-color)] text-brand-text mb-6"
                            />
                            <p className="font-bold">{title}</p>
                            <p
                                className={
                                    card.email
                                        ? 'text-brand-text/90'
                                        : 'font-bold'
                                }
                                dangerouslySetInnerHTML={{
                                    __html: sanitizeHtml(desc),
                                }}
                            />
                            {card.email && (
                                <a
                                    href={`mailto:${card.email}`}
                                    className="font-bold hover:underline"
                                >
                                    {card.email}
                                </a>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
