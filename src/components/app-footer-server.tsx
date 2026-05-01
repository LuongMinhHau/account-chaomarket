import { getBrandSettings } from '@/lib/get-brand-settings';
import AppFooter from './app-footer';

export default async function AppFooterServer() {
    const footerSettings: Record<string, string> = {};

    try {
        const settings = await getBrandSettings();
        // Extract footer-related keys
        const keys = Object.keys(settings).filter((k) => k.startsWith('footer_'));
        keys.forEach((k) => { footerSettings[k] = settings[k]; });
    } catch {
        // Fall back to defaults in client component
    }

    return <AppFooter settings={footerSettings} />;
}
