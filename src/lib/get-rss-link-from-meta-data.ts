import { MarketConfigProps, MetaDataConfig } from '@/services/meta_data';

export interface GetRssLinkProps {
    key: keyof MarketConfigProps;
    config?: MetaDataConfig;
    locale: string;
    type: string;
}

export const getRssLink = ({ key, config, locale, type }: GetRssLinkProps) => {
    const currentTab = config?.market[key].filter(item => item.type === type);

    if (currentTab && currentTab.length > 0) {
        const tab = currentTab[0];
        const localizeContent = tab.localized[locale as 'en' | 'vi'];

        return localizeContent.rss.url;
    }

    return undefined;
};
