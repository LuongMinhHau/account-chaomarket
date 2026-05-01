/**
 * A basic node that only contains a title.
 * Used for the leaf elements of the data tree.
 * @example { "title": "Global" } or { "title": "Thế Giới" }
 */
interface TitledNode {
    title: string;
}

/**
 * Defines the structure for the "US Stocks" module, which includes its own
 * title and a set of specific sub-items.
 */
interface UsStocksNode {
    title: string;
    items: {
        overview: TitledNode;
        heatmap: TitledNode;
        chart: TitledNode;
        news: TitledNode;
        calendar: TitledNode;
    };
}

/**
 * Defines the structure for the "Indices" module.
 */
interface IndicesNode {
    title: string;
    items: {
        global: TitledNode;
        us: TitledNode;
        vietnam: TitledNode;
    };
}

/**
 * Defines the structure for the "Markets" module.
 * Note that `usStocks` has its own complex type (UsStocksNode),
 * while the others are simple TitledNodes.
 */
interface MarketsNode {
    title: string;
    items: {
        usStocks: UsStocksNode;
        vietnamStocks: TitledNode;
        currencies: TitledNode;
        cryptocurrencies: TitledNode;
        commodities: TitledNode;
    };
}

/**
 * Defines the structure for the main "Market Data" module, which contains
 * all the major financial sections of the application.
 */
interface MarketDataNode {
    title: string;
    items: {
        indices: IndicesNode;
        markets: MarketsNode;
        financialNews: TitledNode;
        economicMap: TitledNode;
        economicCalendar: TitledNode;
        chaoInsights: TitledNode;
    };
}

/**
 * The root interface for the entire localization file (en.json or vi.json).
 * This is the main type you will import and use in your application.
 */
export interface MarketData {
    marketData: MarketDataNode;
    stockSymbolLabel: string;
}