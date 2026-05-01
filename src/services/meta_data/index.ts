'use server';

import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

interface RssConfigProps {
    type: string;
    localized: {
        en: { title: string; rss: { url: string; name: string; sourceName?: string } };
        vi: { title: string; rss: { url: string; name: string; sourceName?: string } };
    };
    views?: string[];
    overviewSymbols?: string[];
    overviewCustomSymbols?: Record<string, { tradingViewSymbol: string; description: string }>;
    heatmapConfig?: Record<string, string>;
    chartConfig?: Record<string, string>;
    calendarConfig?: Record<string, string>;
    screenerConfig?: Record<string, string>;
    forexHeatmapConfig?: { currencies?: string[] };
    commoditiesConfig?: { symbols?: { name: string; displayName: string; displayNameVi?: string }[] };
    [key: string]: unknown;
}

export type MarketConfigProps = {
    tabs: Array<RssConfigProps>;
    financialNews: Array<RssConfigProps>;
    socials: Array<RssConfigProps>;
};

export type MetaDataConfig = {
    homeBanner: Array<{
        en: { title: string; description: string; link: string; imgUrl: string };
        vi: { title: string; description: string; link: string; imgUrl: string };
    }>;
    market: MarketConfigProps;
    economicCalendar?: Record<string, unknown>;
    economicMap?: Record<string, unknown>;
    investmentCalculators?: Record<string, unknown>;
};

export const getMetaDataConfig = async (): Promise<{
    success: boolean;
    data?: MetaDataConfig;
    error?: string;
}> => {
    try {
        const result = await db.execute(sql`
            SELECT content FROM "metaData"
            WHERE "isPublished" = true
            ORDER BY version DESC, "createdAt" DESC
            LIMIT 1
        `);

        const row = result.rows?.[0];
        if (!row) {
            return { success: false, error: 'No published metadata config found' };
        }

        return { success: true, data: row.content as MetaDataConfig };
    } catch {
        // Table may not exist in account DB — graceful fallback
        return { success: false, error: 'metaData table not available' };
    }
};
