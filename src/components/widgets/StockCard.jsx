import { useState } from 'react';
import { formatCurrency, formatPercent, formatLargeNumber } from '../../utils/formatters';
import { useStockQuote } from '../../hooks/useStockQuote';
import { useStockCandles, RANGES } from '../../hooks/useStockCandles';
import PriceChart from '../charts/PriceChart';

export default function StockCard({ symbol }) {
  const [range, setRange] = useState('6M');
  const { data: quote, loading: quoteLoading, error: quoteError } = useStockQuote(symbol);
  const { data: candles, loading: candlesLoading, error: candlesError } = useStockCandles(symbol, range);

  if (quoteLoading) return <div className="stock-card loading">{symbol} …</div>;
  if (quoteError)   return <div className="stock-card error">{symbol} failed to load</div>;

  const isPositive = quote.d >= 0;

  // 52-week high/low from candle data (use 1Y candles if available, else current range)
  const prices = candles?.map((d) => d.close) ?? [];
  const weekHigh52 = prices.length ? Math.max(...prices) : null;
  const weekLow52  = prices.length ? Math.min(...prices) : null;

  return (
    <div className={`stock-card ${isPositive ? 'positive' : 'negative'}`}>
      {/* Header */}
      <div className="card-header">
        <div>
          <span className="symbol">{symbol}</span>
        </div>
        <div className="card-price-group">
          <span className="price">{formatCurrency(quote.c)}</span>
          <span className="change">{formatPercent(quote.dp)}</span>
        </div>
      </div>

      {/* Range selector */}
      <div className="range-selector">
        {Object.keys(RANGES).map((r) => (
          <button
            key={r}
            className={`range-btn ${range === r ? 'active' : ''}`}
            onClick={() => setRange(r)}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="chart-wrapper">
        {candlesLoading
          ? <div className="chart-empty">Loading…</div>
          : candlesError
            ? <div className="chart-empty chart-error">Chart unavailable</div>
            : <PriceChart data={candles} isPositive={isPositive} symbol={symbol} />
        }
      </div>

      {/* Stats row */}
      <div className="stats-row">
        <div className="stat">
          <span className="stat-label">Open</span>
          <span className="stat-value">{formatCurrency(quote.o)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">High</span>
          <span className="stat-value">{formatCurrency(quote.h)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Low</span>
          <span className="stat-value">{formatCurrency(quote.l)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Prev Close</span>
          <span className="stat-value">{formatCurrency(quote.pc)}</span>
        </div>
        {weekHigh52 !== null && (
          <>
            <div className="stat">
              <span className="stat-label">52W High</span>
              <span className="stat-value positive-text">{formatCurrency(weekHigh52)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">52W Low</span>
              <span className="stat-value negative-text">{formatCurrency(weekLow52)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
