import { getBrandSettings } from '@/lib/get-brand-settings';
import GeneralBanner, { type BannerDisplayMode } from './general-banner';

interface GeneralBannerServerProps {
    /** Brand settings key to check visibility (e.g. "banner_general_vis__community") */
    visibilityKey?: string;
    /** Brand settings key for display mode (e.g. "banner_general_display_mode__chao_insights") */
    displayModeKey?: string;
}

/**
 * Server wrapper that:
 * 1. Checks banner visibility — if "inactive", hides the banner.
 * 2. Reads custom banner image from Admin settings.
 * 3. Reads display mode (text_only | image_only | image_and_text).
 * 4. Reads slogans (VI/EN) from Admin settings.
 * 5. Passes everything to GeneralBanner.
 */
export default async function GeneralBannerServer({ visibilityKey, displayModeKey }: GeneralBannerServerProps = {}) {
    let imageSrc: string | undefined;
    let displayMode: BannerDisplayMode = "image_and_text";
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
            const mode = settings[displayModeKey] as BannerDisplayMode;
            if (["text_only", "image_only", "image_and_text"].includes(mode)) {
                displayMode = mode;
            }
        }

        // Read slogans from Admin
        if (settings.banner_general_slogan_vi) {
            sloganVi = settings.banner_general_slogan_vi;
        }
        if (settings.banner_general_slogan_en) {
            sloganEn = settings.banner_general_slogan_en;
        }
    } catch {
        // Fall back to defaults inside GeneralBanner component
    }

    return <GeneralBanner imageSrc={imageSrc} displayMode={displayMode} sloganVi={sloganVi} sloganEn={sloganEn} />;
}
