// Stock data API calls
// Replace BASE_URL and API_KEY with your data provider (e.g. Alpha Vantage, Finnhub)

const BASE_URL = 'https://finnhub.io/api/v1';
const API_KEY = import.meta.env.VITE_STOCK_API_KEY;

export async function fetchQuote(symbol) {
  const res = await fetch(`${BASE_URL}/quote?symbol=${symbol}&token=${API_KEY}`);
  if (!res.ok) throw new Error(`Failed to fetch quote for ${symbol}`);
  return res.json();
}

export async function fetchCandles(symbol, resolution = 'D', from, to) {
  const res = await fetch(
    `${BASE_URL}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${API_KEY}`
  );
  if (!res.ok) throw new Error(`Failed to fetch candles for ${symbol}`);
  return res.json();
}
