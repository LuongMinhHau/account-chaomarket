'use client';
import { sanitizeHtml } from '@/lib/sanitize';
import Link from 'next/link';
import Image from 'next/image';
import {
    Facebook,
    Instagram,
    ThreadBlack,
    TikTok,
    Youtube,
    LinkedIn,
} from '@image/index';
import {
    Mail, Headset, Clock, Info, Bell, Phone, MessageCircle, HelpCircle,
    Building, Globe, HeadphonesIcon, Users, Handshake,
    MapPin, Send, AtSign, Shield, Star, Heart, Briefcase, Calendar,
    FileText, Award, Zap, Truck, CreditCard, ShoppingBag, LifeBuoy,
    Megaphone, BookOpen, Link as LinkIcon, ExternalLink, Share2
} from 'lucide-react';
import { useI18n } from '@/context/i18n/context';
import { T } from './app-translate';
import { useIsMobile } from '@/hooks/use-mobile';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

// Platform icon mapping
const PLATFORM_IMAGES: Record<string, typeof Facebook> = {
    facebook: Facebook,
    youtube: Youtube,
    tiktok: TikTok,
    instagram: Instagram,
    threads: ThreadBlack,
    linkedin: LinkedIn,
};

const CONTACT_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
    Info, Bell, Headset, Mail, Clock, Phone, MessageCircle, HelpCircle,
    Building, Globe, HeadphonesIcon, Users, Handshake,
    MapPin, Send, AtSign, Shield, Star, Heart, Briefcase, Calendar,
    FileText, Award, Zap, Truck, CreditCard, ShoppingBag, LifeBuoy,
    Megaphone, BookOpen, Link: LinkIcon, ExternalLink, Share2,
};

// Default values matching what's in the website currently
const DEFAULT_CONTACTS = [
    { label: "Information", value: "info@chaomarket.com", icon: "Bell", isEmail: true },
    { label: "Consulting", value: "consulting@chaomarket.com", icon: "Headset", isEmail: true },
    { label: "Contact", value: "contact@chaomarket.com", icon: "Mail", isEmail: true },
    { label: "Working Hours", value: "Monday – Friday | 09:00 – 17:00", icon: "Clock", isEmail: false },
];

const DEFAULT_SOCIALS = [
    { name: "@Chào Market", url: "https://www.facebook.com/profile.php?id=61580243678116", platform: "facebook" },
    { name: "@chaomarket.com", url: "https://www.tiktok.com/@chaomarket.com", platform: "tiktok" },
    { name: "@ChaoMarket", url: "https://www.youtube.com/@ChaoMarket", platform: "youtube" },
    { name: "@_chaomarket_", url: "https://www.instagram.com/_chaomarket_/", platform: "instagram" },
    { name: "@_chaomarket_", url: "https://www.threads.net/@_chaomarket_/", platform: "threads" },
];

interface AppFooterProps {
    settings?: Record<string, string>;
}

export default function AppFooter({ settings = {} }: AppFooterProps) {
    const { t, locale } = useI18n();
    const isMobile = useIsMobile();

    // Build contact info dynamically from settings
    const contactIndices = new Set<number>();
    for (const key of Object.keys(settings)) {
        const m = key.match(/^footer_contact_(\d+)_/);
        if (m) contactIndices.add(parseInt(m[1], 10));
    }
    for (let i = 1; i <= 4; i++) contactIndices.add(i);
    const contactInfo = Array.from(contactIndices).sort((a, b) => a - b).map((n) => {
        const fallback = DEFAULT_CONTACTS[n - 1];
        const label = locale === 'vi'
            ? (settings[`footer_contact_${n}_label_vi`] || settings[`footer_contact_${n}_label`] || fallback?.label || '')
            : (settings[`footer_contact_${n}_label_en`] || settings[`footer_contact_${n}_label`] || fallback?.label || '');
        const value = settings[`footer_contact_${n}_value`] || fallback?.value || '';
        const iconName = settings[`footer_contact_${n}_icon`] || fallback?.icon || 'Info';
        const visible = settings[`footer_contact_${n}_visible`] ?? 'active';
        const IconComp = CONTACT_ICONS[iconName] || Info;
        const isEmail = value.includes('@');
        return {
            icon: <IconComp size={20} />,
            label,
            value,
            href: isEmail ? `mailto:${value}` : '',
            visible,
        };
    }).filter(item => item.visible === 'active');

    // Build social links dynamically from settings
    const socialIndices = new Set<number>();
    for (const key of Object.keys(settings)) {
        const m = key.match(/^footer_social_(\d+)_/);
        if (m) socialIndices.add(parseInt(m[1], 10));
    }
    for (let i = 1; i <= 5; i++) socialIndices.add(i);
    const socialLinks = Array.from(socialIndices).sort((a, b) => a - b).map((n) => {
        const fallback = DEFAULT_SOCIALS[n - 1];
        const name = settings[`footer_social_${n}_name`] || fallback?.name || '';
        const url = settings[`footer_social_${n}_url`] || fallback?.url || '';
        const platform = settings[`footer_social_${n}_platform`] || fallback?.platform || 'facebook';
        const visible = settings[`footer_social_${n}_visible`] ?? 'active';
        const customIcon = settings[`footer_social_${n}_icon`] || '';
        const imgSrc = PLATFORM_IMAGES[platform] || Facebook;
        return {
            name,
            url,
            icon: customIcon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    alt={`${platform}-img`}
                    className={'size-6 rounded-full p-0.5 object-cover'}
                    src={customIcon}
                    width={24}
                    height={24}
                />
            ) : (
                <Image
                    alt={`${platform}-img`}
                    className={'size-6 rounded-full p-0.5'}
                    src={imgSrc}
                    width={1920}
                    height={1080}
                />
            ),
            visible,
            platform,
        };
    }).filter(item => item.visible === 'active' && item.platform !== 'linkedin');

    // Copyright from settings (locale-aware)
    const copyright = locale === 'vi'
        ? (settings.footer_copyright_vi || t('footer.copyright'))
        : (settings.footer_copyright || t('footer.copyright'));
    const copyrightVisible = (settings.footer_copyright_visible ?? 'active') === 'active';

    // Column headings from settings (locale-aware)
    const col1Heading = locale === 'vi'
        ? (settings.footer_col1_heading_vi || settings.footer_col1_heading || t('footer.getToKnowUs'))
        : (settings.footer_col1_heading_en || settings.footer_col1_heading || t('footer.getToKnowUs'));
    const col2Heading = locale === 'vi'
        ? (settings.footer_col2_heading_vi || settings.footer_col2_heading || t('common.letUsHelpYou'))
        : (settings.footer_col2_heading_en || settings.footer_col2_heading || t('common.letUsHelpYou'));
    const col3Heading = locale === 'vi'
        ? (settings.footer_col3_heading_vi || settings.footer_col3_heading || t('footer.followUs'))
        : (settings.footer_col3_heading_en || settings.footer_col3_heading || t('footer.followUs'));

    // Build navigation links dynamically from settings
    const defaultLinks = [
        { label: "About Us", href: "/about", i18nKey: "footer.aboutUs.title" },
        { label: "Terms of Use", href: "/terms-of-use", i18nKey: "footer.termOfUse.title" },
        { label: "Privacy Policy", href: "/privacy-policy", i18nKey: "footer.privacyPolicy.title" },
        { label: "Support Policy", href: "/support-policy", i18nKey: "footer.supportPolicy.title" },
        { label: "Cookie Policy", href: "/cookie-policy", i18nKey: "footer.cookiePolicy.title" },
    ];
    const linkIndices = new Set<number>();
    for (const key of Object.keys(settings)) {
        const m = key.match(/^footer_link_(\d+)_/);
        if (m) linkIndices.add(parseInt(m[1], 10));
    }
    for (let i = 1; i <= 5; i++) linkIndices.add(i);
    const getToKnowUs = Array.from(linkIndices).sort((a, b) => a - b).map((n) => {
        const fallback = defaultLinks[n - 1];
        const adminLabelEn = settings[`footer_link_${n}_label_en`];
        const adminLabelVi = settings[`footer_link_${n}_label_vi`];
        const adminLabel = settings[`footer_link_${n}_label`]; // old single-language key
        const label = locale === 'vi'
            ? (adminLabelVi || adminLabel || fallback?.label || '')
            : (adminLabelEn || adminLabel || fallback?.label || '');
        const href = settings[`footer_link_${n}_href`] || fallback?.href || '/';
        const order = parseInt(settings[`footer_link_${n}_order`] || String(n), 10);
        const visible = settings[`footer_link_${n}_visible`] ?? 'active';
        // Use i18n only if there's no admin override at all
        const useI18n = !adminLabelEn && !adminLabelVi && !adminLabel;
        return { href, label, i18nKey: useI18n ? (fallback?.i18nKey || '') : '', order, visible };
    }).filter(item => item.visible === 'active').sort((a, b) => a.order - b.order);

    const mobileComp = (
        <div className="flex flex-col mx-auto px-4">
            <Accordion type="single" collapsible className="w-full" defaultValue={'item-1'}>
                {/* 1. Get to Know Us */}
                <AccordionItem value="item-1">
                    <AccordionTrigger className="font-semibold text-brand-text text-sm">
                        {col1Heading}
                    </AccordionTrigger>
                    <AccordionContent>
                        <ul className="space-y-3 pt-2 text-[var(--brand-grey-foreground)]">
                            {getToKnowUs.map(item => (
                                <li key={item.href}>
                                    <Link href={item.href} className="hover:text-brand-text hover:underline">
                                        {item.i18nKey ? <T keyName={item.i18nKey} /> : item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </AccordionContent>
                </AccordionItem>

                {/* 2. Let Us Help You */}
                <AccordionItem value="item-2">
                    <AccordionTrigger className="font-semibold text-brand-text text-sm">
                        {col2Heading}
                    </AccordionTrigger>
                    <AccordionContent>
                        <ul className="space-y-3 pt-2 text-[var(--brand-grey-foreground)]">
                            {contactInfo.map((item, index) => (
                                <li key={index} className="flex justify-between items-center pr-2">
                                    <span className="flex items-center gap-2">
                                        {item.icon}
                                        {item.label}
                                    </span>
                                    <span>
                                        {item.href ? (
                                            <a href={item.href} className="hover:underline text-brand-text font-semibold text-sm">
                                                {item.value}
                                            </a>
                                        ) : (
                                            <span className="text-brand-text font-semibold text-sm whitespace-pre-line text-right">
                                                {item.value}
                                            </span>
                                        )}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </AccordionContent>
                </AccordionItem>

                {/* 3. Follow Us */}
                <AccordionItem value="item-3">
                    <AccordionTrigger className="font-semibold text-brand-text text-sm">
                        {col3Heading}
                    </AccordionTrigger>
                    <AccordionContent>
                        <ul className="space-y-3 pt-2 text-[var(--brand-grey-foreground)]">
                            {socialLinks.map((link, index) => (
                                <li key={index} className="flex justify-between items-center pr-2">
                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                        {link.icon}
                                    </a>
                                    <span>
                                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-brand-text font-semibold">
                                            {link.name}
                                        </a>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {copyrightVisible && (
                <div
                    className="text-center text-xs md:text-base dark:text-[var(--brand-color)] text-brand-text font-medium my-4"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(copyright) }}
                />
            )}
        </div>
    );

    const defaultComp = (
        <div className="max-w-[80svw] flex flex-col justify-center mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:justify-between md:px-8">
                {/* Get to Know Us */}
                <div className="mb-8 md:mb-0">
                    <h3 className="font-semibold text-brand-text mb-4 text-base md:text-lg">
                        {col1Heading}
                    </h3>
                    <ul className="space-y-3 font-medium text-[var(--brand-grey-foreground)] [&>_*_a]:hover:text-brand-text min-w-2/3">
                        {getToKnowUs.map(item => (
                            <li key={item.href}>
                                <Link href={item.href} className="hover:underline">
                                    {item.i18nKey ? <T keyName={item.i18nKey} /> : item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Let Us Help You */}
                <div className="mb-8 md:mb-0">
                    <h3 className="font-semibold text-brand-text mb-4 text-base md:text-lg">
                        {col2Heading}
                    </h3>
                    <ul className="space-y-3 font-medium dark:text-[var(--brand-grey-foreground)] text-[var(--brand-grey-foreground)] min-w-2/3 [&_*_span:last-child]:font-semibold dark:[&_*_span:last-child]:text-brand-text [&>_*_a]:text-brand-text">
                        {contactInfo.map((item, index) => (
                            <li key={index} className="flex justify-between gap-12">
                                <span className="flex items-center gap-2">
                                    {item.icon}
                                    {item.label}
                                </span>
                                <span>
                                    {item.href ? (
                                        <a href={item.href} className="hover:underline">
                                            {item.value}
                                        </a>
                                    ) : (
                                        <span className="whitespace-pre-line text-right">{item.value}</span>
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Follow Us */}
                <div>
                    <h3 className="font-semibold text-brand-text mb-4 text-lg">
                        {col3Heading}
                    </h3>
                    <ul className="space-y-3 text-normal dark:text-[var(--brand-grey-foreground)] min-w-2/3">
                        {socialLinks.map((link, index) => (
                            <li key={index} className="flex justify-between gap-12">
                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[var(--brand-color)]">
                                    {link.icon}
                                </a>
                                <span>
                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-brand-text font-semibold">
                                        {link.name}
                                    </a>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {copyrightVisible && (
                <div
                    className="text-center text-base dark:text-[var(--brand-color)] text-brand-text font-medium mt-6"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(copyright) }}
                />
            )}
        </div>
    );

    return (
        <footer className="dark:bg-sidebar border-t px-12 py-10">
            {isMobile ? mobileComp : defaultComp}
        </footer>
    );
}
