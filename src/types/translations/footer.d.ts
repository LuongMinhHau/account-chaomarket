/**
 * Defines the structure for a single section within a policy page,
 * like "1. Acceptance of Terms" in the Term of Use.
 */
export interface FooterSection {
    title: string;
    content: string;
}

export interface AboutUsSection {
    title: string;
    content: string[];
}

/**
 * Defines the structure for the "About Us" content, which consists of a main
 * title and an array of strings, where each string is a paragraph.
 */
export interface AboutUsContent {
    title: string;
    sections: AboutUsSection[];
}

/**
 * Defines the structure for a full policy page (Term of Use, Privacy Policy, etc.).
 * It includes a main title and an array of sections.
 */
export interface PolicyContent {
    title: string;
    sections: FooterSection[];
}

/**
 * Defines the main structure for the entire 'footer' object in the translation files.
 * This is the interface that will be imported into the main TranslationsStructure.
 */
export interface FooterTranslations {
    aboutUs: AboutUsContent;
    termOfUse: PolicyContent;
    privacyPolicy: PolicyContent;
    cookiePolicy: PolicyContent;
    supportPolicy: PolicyContent;
    getToKnowUs: string;
    followUs: string;
    joinGroup: string;
    copyright: string;
}
