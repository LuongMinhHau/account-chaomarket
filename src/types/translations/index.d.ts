import { CommonTranslations } from '@/types/translations/common';
import { AuthTranslations } from '@/types/translations/auth';
import { ValidationTranslations } from '@/types/translations/validation';
import { CartItemsTranslations } from '@/types/translations/cart';
import { OurSolutionsTranslations } from '@/types/translations/solutions';
import { SidebarTranslations } from '@/types/translations/sidebar';
import { BookConsultationTranslations } from '@/types/translations/book-consultations';
import { FooterTranslations } from '@/types/translations/footer';
import { MarketData } from '@/types/translations/market-data';
import { Investors } from '@/types/translations/investors';
import { AccountTranslations } from '@/types/translations/account';
import ToolsTranslations from '@/types/translations/tools';
import { DisclaimerTranslation } from '@/types/translations/disclaimer';
import { PerformanceNoticeTranslations } from '@/types/translations/performance-notice-translations';
import { HelpAndFeedback } from '@/types/translations/help-and-feedback';
import { BrandSloganTranslations } from './brand-slogan-translations';
import { NotificationsTranslations } from '@/types/translations/notifications';
import { OrdersTranslations } from '@/types/translations/orders';
import { SecurityTranslations, DevicesTranslations, TwoFactorTranslations, LoginVerificationTranslations, PrivacyPageTranslations } from '@/types/translations/security';

export type LanguageOptions = 'en' | 'vi';

export interface TranslationsStructure {
    common: CommonTranslations;
    auth: AuthTranslations;
    validation: ValidationTranslations;
    consultationRequest: CartItemsTranslations;
    ourSolutions: OurSolutionsTranslations;
    sidebar: SidebarTranslations;
    bookConsultation: BookConsultationTranslations;
    contactButton: ContactButtonTranslations;
    footer: FooterTranslations;
    marketData: MarketData;
    investors: Investors;
    community: CommunityTranslations;
    account: AccountTranslations;
    tool: ToolsTranslations;
    disclaimer: DisclaimerTranslation;
    performanceNotice: PerformanceNoticeTranslations;
    helpAndFeedback: HelpAndFeedback;
    brandSlogan: BrandSloganTranslations;
    lossRecovery: LossRecoveryTranslations;
    notifications: NotificationsTranslations;
    orders: OrdersTranslations;
    security: SecurityTranslations;
    devices: DevicesTranslations;
    twoFactor: TwoFactorTranslations;
    loginVerification: LoginVerificationTranslations;
    privacyPage: PrivacyPageTranslations;
}

type Leaves<T, K extends string = ''> = T extends object
    ? {
          [P in keyof T]-?: P extends string
              ? T[P] extends object
                  ? Leaves<T[P], `${K}${K extends '' ? '' : '.'}${P}`>
                  : `${K}${K extends '' ? '' : '.'}${P}`
              : never;
      }[keyof T]
    : K;

export type TranslationKey = Leaves<TranslationsStructure>;
