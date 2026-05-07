'use client';
import { sanitizeHtml } from '@/lib/sanitize';
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

// Social brand SVG icons (lucide doesn't ship brand icons)
function FacebookIcon({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
    );
}
function InstagramIcon({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
    );
}
function YoutubeIcon({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
    );
}
function TikTokIcon({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78 2.93 2.93 0 0 1 .88.13v-3.5a6.37 6.37 0 0 0-.88-.07 6.34 6.34 0 0 0 0 12.68 6.34 6.34 0 0 0 6.34-6.34V9.41a8.16 8.16 0 0 0 3.76.92V6.69Z"/>
        </svg>
    );
}
function ThreadsIcon({ size = 20 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 192 192" fill="currentColor">
            <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.229c8.249.053 14.474 2.452 18.503 7.129 2.932 3.405 4.893 8.111 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.326-38.219 34.834.476 10.148 5.327 18.89 13.657 24.616 7.024 4.826 16.086 7.2 25.49 6.682 12.394-.682 22.112-5.616 28.886-14.651 5.143-6.86 8.374-15.584 9.744-26.408 5.843 3.519 10.183 8.163 12.675 13.877 4.228 9.693 4.474 25.615-8.186 38.254-11.092 11.07-24.438 15.862-44.56 16.025-22.342-.183-39.267-7.316-50.293-21.2C36.836 139.964 30.958 120.192 30.72 96c.238-24.192 6.116-43.963 17.468-58.748C59.214 23.368 76.14 16.235 98.48 16.052c22.529.19 39.725 7.376 51.136 21.35 5.605 6.864 9.882 15.272 12.773 25.003l15.453-4.122c-3.425-11.535-8.54-21.604-15.335-30.062C148.135 10.637 127.378 1.97 98.522 1.741h-.082C69.746 1.97 49.227 10.647 35.253 28.203 23.78 42.768 17.253 62.56 16.715 87.485l-.004.523-.002 8-.002.52c.538 24.933 7.065 44.73 18.537 59.297 13.962 17.542 34.48 26.21 63.257 26.447h.082c24.033-.19 41.304-6.48 55.846-20.37 18.787-18.762 17.685-42.404 11.483-56.622-4.35-9.975-12.53-18.003-23.65-23.291z"/>
        </svg>
    );
}

// Platform icon mapping
const PLATFORM_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
    facebook: FacebookIcon,
    youtube: YoutubeIcon,
    tiktok: TikTokIcon,
    instagram: InstagramIcon,
    threads: ThreadsIcon,
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
        const IconComp = PLATFORM_ICONS[platform] || FacebookIcon;
        return {
            name,
            url,
            icon: customIcon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    alt={`${platform}-img`}
                    className={'footer-social-icon-img'}
                    src={customIcon}
                    width={20}
                    height={20}
                />
            ) : (
                <IconComp size={20} />
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
