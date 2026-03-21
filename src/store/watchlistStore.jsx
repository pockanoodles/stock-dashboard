import { createContext, useContext, useState } from 'react';

const WatchlistContext = createContext(null);

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState(['AAPL', 'GOOGL', 'MSFT']);

  const add = (symbol) =>
    setWatchlist((prev) => (prev.includes(symbol) ? prev : [...prev, symbol]));

  const remove = (symbol) =>
    setWatchlist((prev) => prev.filter((s) => s !== symbol));

  return (
    <WatchlistContext.Provider value={{ watchlist, add, remove }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  return useContext(WatchlistContext);
}
