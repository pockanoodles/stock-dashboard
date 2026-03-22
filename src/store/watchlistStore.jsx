import { createContext, useContext, useState } from 'react';

export const SECTIONS = [
  {
    label: 'Global Bellwethers',
    symbols: ['NVDA', 'AMZN', 'JPM'],
  },
  {
    label: 'Major Japanese Stocks (ADRs)',
    symbols: ['TM', 'SONY', 'SFTBY'],
  },
  {
    label: 'Japan–US Sensitivity',
    symbols: ['NTDOY', 'MUFG', 'HMC'],
  },
];

const ALL_SYMBOLS = SECTIONS.flatMap((s) => s.symbols);

const WatchlistContext = createContext(null);

export function WatchlistProvider({ children }) {
  const [watchlist] = useState(ALL_SYMBOLS);

  return (
    <WatchlistContext.Provider value={{ watchlist }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  return useContext(WatchlistContext);
}
