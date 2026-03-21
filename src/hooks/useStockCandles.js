import { useState, useEffect } from 'react';
import { fetchCandles } from '../api/stockApi';

const RANGES = {
  '1M': 30,
  '3M': 90,
  '6M': 180,
  '1Y': 365,
};

export function useStockCandles(symbol, range = '6M') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    setError(null);

    const to = Math.floor(Date.now() / 1000);
    const from = to - RANGES[range] * 86400;

    fetchCandles(symbol, 'D', from, to)
      .then((raw) => {
        if (!raw.t || raw.s === 'no_data') {
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
      .catch(setError)
      .finally(() => setLoading(false));
  }, [symbol, range]);

  return { data, loading, error };
}

export { RANGES };
