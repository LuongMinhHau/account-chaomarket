import { getBrandSettings } from '@/lib/get-brand-settings';
import ContactButton from './app-contacts';

export default async function ContactButtonServer() {
    const chatSettings: Record<string, string> = {};

    try {
        const settings = await getBrandSettings();
        // Extract quickchat-related keys
        const keys = Object.keys(settings).filter((k) => k.startsWith('quickchat_'));
        keys.forEach((k) => { chatSettings[k] = settings[k]; });
    } catch {
        // Fall back to defaults in client component
    }

    return <ContactButton settings={chatSettings} />;
}
