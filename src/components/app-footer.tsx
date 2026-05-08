'use client';
import { sanitizeHtml } from '@/lib/sanitize';
import Image from 'next/image';
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

// Platform brand images (same as Chào Help)
const PLATFORM_IMAGES: Record<string, string> = {
    facebook: '/img/facebook.png',
    youtube: '/img/youtube-icon.png',
    tiktok: '/img/tiktok.png',
    instagram: '/img/instagram.png',
    threads: '/img/threads.png',
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
            isStatic: !isEmail,
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
        const imgSrc = PLATFORM_IMAGES[platform] || PLATFORM_IMAGES.facebook;
        return {
            name,
            url,
            icon: customIcon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    alt={`${platform}-img`}
                    className={'size-5 rounded-full object-cover'}
                    src={customIcon}
                    width={20}
                    height={20}
                />
            ) : (
                <Image
                    alt={`${platform}-img`}
                    className={'size-5 rounded-full'}
                    src={imgSrc}
                    width={20}
                    height={20}
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
        ? (settings.footer_col1_heading_vi || settings.footer_col1_heading || t('footer.legal'))
        : (settings.footer_col1_heading_en || settings.footer_col1_heading || t('footer.legal'));
    const col2Heading = locale === 'vi'
        ? (settings.footer_col2_heading_vi || settings.footer_col2_heading || t('common.letUsHelpYou'))
        : (settings.footer_col2_heading_en || settings.footer_col2_heading || t('common.letUsHelpYou'));
    const col3Heading = locale === 'vi'
        ? (settings.footer_col3_heading_vi || settings.footer_col3_heading || t('footer.followUs'))
        : (settings.footer_col3_heading_en || settings.footer_col3_heading || t('footer.followUs'));

    // Build navigation links dynamically from settings
    const defaultLinks = [
        { label: "Privacy Policy", href: "https://policy.chaomarket.com/privacy-policy", i18nKey: "footer.privacyPolicy.title" },
        { label: "Terms of Use", href: "https://policy.chaomarket.com/terms-of-use", i18nKey: "footer.termOfUse.title" },
        { label: "Cookie Policy", href: "https://policy.chaomarket.com/cookie-policy", i18nKey: "footer.cookiePolicy.title" },
        { label: "Support Policy", href: "https://policy.chaomarket.com/support-policy", i18nKey: "footer.supportPolicy.title" },
    ];
    const linkIndices = new Set<number>();
    for (const key of Object.keys(settings)) {
        const m = key.match(/^footer_link_(\d+)_/);
        if (m) linkIndices.add(parseInt(m[1], 10));
    }
    for (let i = 1; i <= 4; i++) linkIndices.add(i);
    const legalLinks = Array.from(linkIndices).sort((a, b) => a - b).map((n) => {
        const fallback = defaultLinks[n - 1];
        const adminLabelEn = settings[`footer_link_${n}_label_en`];
        const adminLabelVi = settings[`footer_link_${n}_label_vi`];
        const adminLabel = settings[`footer_link_${n}_label`];
        const label = locale === 'vi'
            ? (adminLabelVi || adminLabel || fallback?.label || '')
            : (adminLabelEn || adminLabel || fallback?.label || '');
        const href = settings[`footer_link_${n}_href`] || fallback?.href || '/';
        const order = parseInt(settings[`footer_link_${n}_order`] || String(n), 10);
        const visible = settings[`footer_link_${n}_visible`] ?? 'active';
        const useI18n = !adminLabelEn && !adminLabelVi && !adminLabel;
        return { href, label, i18nKey: useI18n ? (fallback?.i18nKey || '') : '', order, visible };
    }).filter(item => item.visible === 'active').sort((a, b) => a.order - b.order);

    return (
        <footer className="main-footer" role="contentinfo">
            <div className="footer-container">
                <div className="footer-grid">
                    {/* ── Column 1: Legal ── */}
                    <details className="footer-col" open={!isMobile} data-accordion-item="1">
                        <summary className="footer-col-heading">
                            {col1Heading}
                        </summary>
                        <ul className="footer-list">
                            {legalLinks.map(item => (
                                <li key={item.href} className="footer-list-item footer-list-item--single">
                                    <a
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="footer-item-value"
                                    >
                                        {item.i18nKey ? <T keyName={item.i18nKey} /> : item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </details>

                    {/* ── Column 2: Let Us Help You ── */}
                    <details className="footer-col" open={!isMobile} data-accordion-item="2">
                        <summary className="footer-col-heading">
                            {col2Heading}
                        </summary>
                        <ul className="footer-list">
                            {contactInfo.map((item, index) => (
                                <li key={index} className="footer-list-item">
                                    <span className="footer-item-label">
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </span>
                                    <span>
                                        {item.href ? (
                                            <a href={item.href} className="footer-item-value">
                                                {item.value}
                                            </a>
                                        ) : (
                                            <span className="footer-item-value footer-item-static">
                                                {item.value}
                                            </span>
                                        )}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </details>

                    {/* ── Column 3: Follow Us (icon-only horizontal row) ── */}
                    <details className="footer-col" open={!isMobile} data-accordion-item="3">
                        <summary className="footer-col-heading">
                            {col3Heading}
                        </summary>
                        <ul className="footer-list footer-list--social">
                            {socialLinks.map((link, index) => (
                                <li key={index}>
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="footer-social-icon"
                                        aria-label={`${link.platform} — ${link.name}`}
                                    >
                                        {link.icon}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </details>
                </div>

                {/* ── Copyright ── */}
                {copyrightVisible && (
                    <div
                        className="footer-copyright"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(copyright) }}
                    />
                )}
            </div>
        </footer>
    );
}
