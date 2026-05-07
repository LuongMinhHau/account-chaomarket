'use client';

import { Scale, ExternalLink, FileText, Shield, Cookie } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import PageHeader from '@/components/page-header';
import { useI18n } from '@/context/i18n/context';

export default function LegalPage() {
    const { t } = useI18n();

    const legalLinks = [
        {
            title: t('account.legalPage.termsTitle'),
            description: t('account.legalPage.termsDesc'),
            href: 'https://policy.chaomarket.com/terms-of-use',
            icon: <FileText className="size-5" />,
            color: 'from-blue-500 to-blue-600',
        },
        {
            title: t('account.legalPage.privacyTitle'),
            description: t('account.legalPage.privacyDesc'),
            href: 'https://policy.chaomarket.com/privacy-policy',
            icon: <Shield className="size-5" />,
            color: 'from-emerald-500 to-emerald-600',
        },
        {
            title: t('account.legalPage.refundTitle'),
            description: t('account.legalPage.refundDesc'),
            href: 'https://policy.chaomarket.com/support-policy',
            icon: <Scale className="size-5" />,
            color: 'from-violet-500 to-violet-600',
        },
        {
            title: t('account.legalPage.cookieTitle'),
            description: t('account.legalPage.cookieDesc'),
            href: 'https://policy.chaomarket.com/cookie-policy',
            icon: <Cookie className="size-5" />,
            color: 'from-amber-500 to-orange-500',
        },
    ];

    return (
        <div className="w-full h-full mx-auto space-y-6">
            <PageHeader
                title={t('account.legalPage.pageTitle')}
                description={t('account.legalPage.pageDescription')}
            />

            <Card className="page-card">
                <CardContent className="p-6 space-y-3">
                    {legalLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="stagger-item group flex items-center gap-4 p-5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] transition-all duration-300 hover:border-black/[0.18] dark:hover:border-white/[0.18] hover:shadow-md hover:-translate-y-0.5"
                        >
                            {/* Icon */}
                            <div className={`flex-shrink-0 size-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br shadow-lg ${link.color}`}>
                                {link.icon}
                            </div>
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h2 className="font-semibold text-[16px] text-foreground group-hover:text-[var(--brand-color)] transition-colors">
                                    {link.title}
                                </h2>
                                <p className="text-[13px] text-muted-foreground mt-0.5">
                                    {link.description}
                                </p>
                            </div>
                            {/* Arrow */}
                            <ExternalLink className="size-4 text-muted-foreground group-hover:text-[var(--brand-color)] transition-colors shrink-0" />
                        </a>
                    ))}

                    <div className="rounded-xl bg-muted/30 dark:bg-white/[0.02] p-4 mt-4 border border-black/[0.04] dark:border-white/[0.04]">
                        <p className="text-xs text-muted-foreground text-center leading-relaxed">
                            {t('account.legalPage.disclaimer')}{' '}
                            <a href="mailto:support@chaomarket.com" className="text-[var(--brand-color)] hover:underline font-medium">support@chaomarket.com</a>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
