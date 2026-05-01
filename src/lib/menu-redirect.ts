import { adminDb, brandSettings } from '@/lib/admin-db';

// ── Children config for each parent group ──
// Order matters: first visible child = redirect target
const PARENT_CHILDREN: Record<string, { visKey: string; url: string }[]> = {
    home: [
        { visKey: 'sidebar_vis__home__welcome', url: '/home/welcome' },
        { visKey: 'sidebar_vis__home__announcements', url: '/home/announcements' },
    ],
    market_data: [
        { visKey: 'sidebar_vis__market_data__indices', url: '/market-data/indices' },
        { visKey: 'sidebar_vis__market_data__markets', url: '/market-data/markets' },
        { visKey: 'sidebar_vis__market_data__financial_news', url: '/market-data/financial-news' },
        { visKey: 'sidebar_vis__market_data__economic_map', url: '/market-data/economic-map' },
        { visKey: 'sidebar_vis__market_data__economic_calendar', url: '/market-data/economic-calendar' },
    ],
    investment_calculators: [
        { visKey: 'sidebar_vis__investment_calculators__profit_metrics', url: '/investment-calculators/profit-metrics/interest' },
        { visKey: 'sidebar_vis__investment_calculators__trade_metrics', url: '/investment-calculators/trade-metrics/currency-converter-and-pip' },
    ],
    products: [
        { visKey: 'sidebar_vis__products__trading_tools', url: '/products/trading-tools' },
        { visKey: 'sidebar_vis__products__ai_software', url: '/products/ai-software' },
        { visKey: 'sidebar_vis__products__courses', url: '/products/courses' },
        { visKey: 'sidebar_vis__products__custom_solutions', url: '/products/custom-solutions' },
    ],
};

/**
 * Get the URL of the first visible child for a parent menu group.
 * Reads visibility settings from the admin DB.
 * Falls back to the first child's URL if DB fails.
 */
export async function getFirstVisibleChildUrl(parentGroup: string): Promise<string> {
    const children = PARENT_CHILDREN[parentGroup];
    if (!children || children.length === 0) {
        throw new Error(`Unknown parent group: ${parentGroup}`);
    }

    // Fallback URL = first child (original hard-coded behavior)
    const fallbackUrl = children[0].url;

    try {
        const db = adminDb();
        const rows = await db.select().from(brandSettings);

        const vis: Record<string, string> = {};
        for (const row of rows) {
            if (row.key.startsWith('sidebar_vis__')) {
                vis[row.key] = row.value;
            }
        }

        // Find first child whose visibility key is NOT "inactive"
        for (const child of children) {
            if (vis[child.visKey] !== 'inactive') {
                return child.url;
            }
        }

        // All children are inactive — still redirect to the first one
        // (the page remains accessible, just hidden from sidebar)
        return fallbackUrl;
    } catch {
        // DB unavailable — use the default hard-coded URL
        return fallbackUrl;
    }
}
