import { useState, useEffect } from 'react';
import { fetchQuote } from '../api/stockApi';

export function useStockQuote(symbol) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    fetchQuote(symbol)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [symbol]);

  return { data, loading, error };
}
