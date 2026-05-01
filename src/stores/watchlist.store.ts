import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_TICKERS = 20;

interface WatchlistStore {
    tickers: string[];
    addTicker: (ticker: string) => void;
    removeTicker: (ticker: string) => void;
    reorderTickers: (tickers: string[]) => void;
}

export const useWatchlistStore = create(
    persist<WatchlistStore>(
        (set) => ({
            tickers: ['VNINDEX'],
            addTicker: (ticker: string) =>
                set((state) => {
                    const upper = ticker.toUpperCase().trim();
                    if (!upper) return state;
                    if (state.tickers.includes(upper)) return state;
                    if (state.tickers.length >= MAX_TICKERS) return state;
                    return { tickers: [...state.tickers, upper] };
                }),
            removeTicker: (ticker: string) =>
                set((state) => ({
                    tickers: state.tickers.filter((t) => t !== ticker),
                })),
            reorderTickers: (tickers: string[]) =>
                set({ tickers }),
        }),
        { name: 'watchlist-storage' }
    )
);
