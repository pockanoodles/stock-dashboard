import { useState, useEffect } from 'react';
import { fetchCandles } from '../api/stockApi';

const RANGES = {
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
};

// Stagger requests by symbol to avoid burst rate limiting
const SYMBOL_DELAY = { AAPL: 0, GOOGL: 300, MSFT: 600 };

export function useStockCandles(symbol, range = '6M') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    setError(null);

    const delay = SYMBOL_DELAY[symbol] ?? 0;
    const timer = setTimeout(() => {
      fetchCandles(symbol, range)
        .then(setData)
        .catch((err) => {
          console.error(`[candles] fetch error for ${symbol}:`, err);
          setError(err);
        })
        .finally(() => setLoading(false));
    }, delay);

    return () => clearTimeout(timer);
  }, [symbol, range]);

  return { data, loading, error };
}

export { RANGES };
