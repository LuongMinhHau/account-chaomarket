import { DropdownOption } from '@/components/app-dropdown';
import { AppFilterOptionsType } from '@/components/app-filter-select';

export const MARKET_OPTIONS: AppFilterOptionsType[] = [
    {
        name: 'common.marketType.all',
        value: 'all',
    },
    {
        name: 'common.marketType.stocks',
        value: 'stocks',
    },
    {
        name: 'common.marketType.cryptocurrencies',
        value: 'cryptocurrencies',
    },
    {
        name: 'common.marketType.currencies',
        value: 'currencies',
    },
    {
        name: 'common.marketType.commodities',
        value: 'commodities',
    },
];

export const ACCOUNT_OPTIONS: AppFilterOptionsType[] = [
    {
        name: 'A-Z',
        value: 'a-z',
    },
    {
        name: 'Z-A',
        value: 'z-a',
    },
];

export const PROFIT_OPTIONS: AppFilterOptionsType[] = [
    {
        name: 'common.marketType.all',
        value: 'all',
    },
    {
        name: 'common.roiNegative',
        value: 'negative',
    },
    {
        name: 'common.roi0to10',
        value: '0-10',
    },
    {
        name: 'common.roi10to50',
        value: '10-50',
    },
    {
        name: 'common.roiOver50',
        value: 'over-50',
    },
];

export const NET_PROFIT_OPTIONS: AppFilterOptionsType[] = [
    {
        name: 'common.marketType.all',
        value: 'all',
    },
    {
        name: 'common.np0to1k',
        value: '0-1k',
    },
    {
        name: 'common.np1kTo5k',
        value: '1k-5k',
    },
    {
        name: 'common.np5kTo10k',
        value: '5k-10k',
    },
    {
        name: 'common.npOver10k',
        value: 'over-10k',
    },
];

export const MAX_DRAWDOWN_OPTIONS: AppFilterOptionsType[] = [
    {
        name: 'common.marketType.all',
        value: 'all',
    },
    {
        name: 'common.dd0to10',
        value: '0-10',
    },
    {
        name: 'common.dd10to50',
        value: '10-50',
    },
    {
        name: 'common.ddOver50',
        value: 'over-50',
    },
];

export const VIEW_OPTIONS: AppFilterOptionsType[] = [
    {
        name: 'common.lowToHight',
        value: 'low-to-high',
    },
    {
        name: 'common.hightToLow',
        value: 'high-to-low',
    },
];

export const ALGO_TRADING_OPTIONS: AppFilterOptionsType[] = [
    {
        name: 'common.marketType.all',
        value: 'all',
    },
    {
        name: 'common.automationCustom',
        value: 'custom',
    },
];

const CLIENT_ACCOUNT_GROUP = {
    DEPOSIT: 'Deposit',
    START_DATE: 'Start Date',
    MARKET: 'Market',
    DEFAULT: 'Default',
};

const NEWS_EVENT_GROUP = {
    DATE: 'Date',
    MARKET: 'Market',
    DEFAULT: 'Default',
};

export const SORT_BY_OPTIONS: DropdownOption[] = [
    {
        value: 'desc',
        label: 'Newest first',
        group: CLIENT_ACCOUNT_GROUP.START_DATE,
    },
    {
        value: 'asc',
        label: 'Oldest first',
        group: CLIENT_ACCOUNT_GROUP.START_DATE,
    },
    {
        value: 'all',
        label: 'All',
        group: CLIENT_ACCOUNT_GROUP.MARKET,
    },
    {
        value: 'stocks',
        label: 'Stocks',
        group: CLIENT_ACCOUNT_GROUP.MARKET,
    },
    {
        value: 'cryptocurrencies',
        label: 'Cryptocurrencies',
        group: CLIENT_ACCOUNT_GROUP.MARKET,
    },
    {
        value: 'currencies',
        label: 'Currencies',
        group: CLIENT_ACCOUNT_GROUP.MARKET,
    },
    {
        value: 'commodities',
        label: 'Commodities',
        group: CLIENT_ACCOUNT_GROUP.MARKET,
    },
    {
        value: 'featured',
        label: 'Featured',
        group: CLIENT_ACCOUNT_GROUP.DEFAULT,
    },
];

export const SORT_BY_OPTIONS_NEWS_EVENT: DropdownOption[] = [
    {
        value: 'featured',
        label: 'Featured',
        group: NEWS_EVENT_GROUP.DEFAULT,
    },
    {
        value: 'desc',
        label: 'Newest first',
        group: NEWS_EVENT_GROUP.DATE,
    },
    {
        value: 'asc',
        label: 'Oldest first',
        group: NEWS_EVENT_GROUP.DATE,
    },
    {
        value: 'all',
        label: 'All',
        group: CLIENT_ACCOUNT_GROUP.MARKET,
    },
    {
        value: 'stocks',
        label: 'Stocks',
        group: CLIENT_ACCOUNT_GROUP.MARKET,
    },
    {
        value: 'cryptocurrencies',
        label: 'Cryptocurrencies',
        group: CLIENT_ACCOUNT_GROUP.MARKET,
    },
    {
        value: 'currencies',
        label: 'Currencies',
        group: CLIENT_ACCOUNT_GROUP.MARKET,
    },
    {
        value: 'commodities',
        label: 'Commodities',
        group: CLIENT_ACCOUNT_GROUP.MARKET,
    },
];
