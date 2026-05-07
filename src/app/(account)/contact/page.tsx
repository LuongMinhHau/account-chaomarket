import { getBrandSettings } from '@/lib/get-brand-settings';
import { getServerLocale } from '@/lib/get-server-locale';
import ContactContent, { type ContactCard } from './contact-content';
import type { Metadata } from 'next';

// ── Card defaults (same as Chào Market) ──
const CARD_DEFAULTS = [
    { icon: "Users", titleEn: "Consulting", titleVi: "Tư Vấn", descEn: "Tell us what you need — We are here to help", descVi: "Hãy cho chúng tôi biết bạn cần gì — Chúng tôi luôn sẵn sàng hỗ trợ", email: "consulting@chaomarket.com" },
    { icon: "Handshake", titleEn: "Support", titleVi: "Hỗ Trợ", descEn: "We are here to help", descVi: "Chúng tôi luôn sẵn sàng hỗ trợ bạn", email: "support@chaomarket.com" },
    { icon: "Mail", titleEn: "Contact", titleVi: "Liên Hệ", descEn: "General inquiries", descVi: "Thắc mắc chung", email: "contact@chaomarket.com" },
    { icon: "Clock", titleEn: "Working Hours", titleVi: "Giờ Làm Việc", descEn: "Monday – Friday: 9:00 – 18:00 (GMT+7)<br />Saturday: 9:00 – 12:00 (GMT+7)", descVi: "Thứ Hai – Thứ Sáu: 9:00 – 18:00 (GMT+7)<br />Thứ Bảy: 9:00 – 12:00 (GMT+7)", email: "" },
];

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getServerLocale();
    return { title: locale === 'vi' ? 'Liên Hệ' : 'Contact' };
}

export default async function ContactPage() {
    const settings = await getBrandSettings();

    // Read EN/VI heading — fall back to old single-language key, then to default
    const headingEn = settings.contact_heading_en || settings.contact_heading || "Let us help you";
    const headingVi = settings.contact_heading_vi || "Hãy để chúng tôi giúp bạn";

    const cards: ContactCard[] = CARD_DEFAULTS.map((fallback, idx) => {
        const n = idx + 1;
        const iconName = settings[`contact_card_${n}_icon`] || fallback.icon;
        const visible = (settings[`contact_card_${n}_visible`] ?? 'active') === 'active';
        return {
            icon: iconName,
            titleEn: settings[`contact_card_${n}_title_en`] || settings[`contact_card_${n}_title`] || fallback.titleEn,
            titleVi: settings[`contact_card_${n}_title_vi`] || fallback.titleVi,
            descEn: settings[`contact_card_${n}_desc_en`] || settings[`contact_card_${n}_desc`] || fallback.descEn,
            descVi: settings[`contact_card_${n}_desc_vi`] || fallback.descVi,
            email: settings[`contact_card_${n}_email`] ?? fallback.email,
            visible,
        };
    }).filter(card => card.visible);

    return <ContactContent headingEn={headingEn} headingVi={headingVi} cards={cards} />;
}
