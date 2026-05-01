import { getBrandSettings } from '@/lib/get-brand-settings';
import ClientAccountBanner, { type ClientAccountDisplayMode } from './client-account-banner';

interface ClientAccountBannerServerProps {
    /** Brand settings key to check visibility */
    visibilityKey?: string;
    /** Brand settings key for display mode */
    displayModeKey?: string;
}

/**
 * Server wrapper that:
 * 1. Checks banner visibility — if "inactive", hides the banner.
 * 2. Reads custom banner image from Admin settings.
 * 3. Reads display mode (text_only | image_only | image_and_text).
 * 4. Reads slogan overrides from Admin settings.
 * 5. Passes all data to ClientAccountBanner.
 */
export default async function ClientAccountBannerServer({ visibilityKey, displayModeKey }: ClientAccountBannerServerProps = {}) {
    let imageSrc: string | undefined;
    let displayMode: ClientAccountDisplayMode = "text_only";
    let sloganVi: string | undefined;
    let sloganEn: string | undefined;

    try {
        const settings = await getBrandSettings();

        // Check visibility — if the key exists and is "inactive", hide the banner
        if (visibilityKey && settings[visibilityKey] === 'inactive') {
            return null;
        }

        // Read custom banner image from Admin
        if (settings.banner_general_image) {
            imageSrc = settings.banner_general_image;
        }

        // Read display mode from Admin
        if (displayModeKey && settings[displayModeKey]) {
            const mode = settings[displayModeKey] as ClientAccountDisplayMode;
            if (["text_only", "image_only", "image_and_text"].includes(mode)) {
                displayMode = mode;
            }
        }

        // Read slogan overrides from Admin
        if (settings.banner_general_slogan_vi) {
            sloganVi = settings.banner_general_slogan_vi;
        }
        if (settings.banner_general_slogan_en) {
            sloganEn = settings.banner_general_slogan_en;
        }
    } catch {
        // If settings fetch fails, show banner with defaults
    }

    return <ClientAccountBanner imageSrc={imageSrc} displayMode={displayMode} sloganVi={sloganVi} sloganEn={sloganEn} />;
}
