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
      const to = Math.floor(Date.now() / 1000);
      const from = to - RANGES[range] * 86400;
      // Use weekly resolution for 1Y to stay within free-tier limits
      const resolution = range === '1Y' ? 'W' : 'D';

      fetchCandles(symbol, resolution, from, to)
        .then((raw) => {
          if (!raw.t || raw.s !== 'ok') {
            console.warn(`[Finnhub] no_data for ${symbol} ${range}:`, raw);
            setData([]);
            return;
          }
          const points = raw.t.map((ts, i) => ({
            date: new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            close: raw.c[i],
            high: raw.h[i],
            low: raw.l[i],
            volume: raw.v[i],
          }));
          setData(points);
        })
        .catch((err) => {
          console.error(`[Finnhub] fetch error for ${symbol}:`, err);
          setError(err);
        })
        .finally(() => setLoading(false));
    }, delay);

    return () => clearTimeout(timer);
  }, [symbol, range]);

  return { data, loading, error };
}

export { RANGES };
