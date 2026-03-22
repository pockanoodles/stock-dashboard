import { useState } from 'react';
import Header from '../components/layout/Header';
import StockCard from '../components/widgets/StockCard';
import MarketSummary from '../components/MarketSummary';
import { useWatchlist } from '../store/watchlistStore';
import { SECTIONS } from '../store/watchlistStore';
import { fetchQuote } from '../api/stockApi';
import { analyzeMarket } from '../api/analyzeMarket';

export default function Dashboard() {
  const { watchlist } = useWatchlist();
  const [summary, setSummary] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  async function handleAnalyze() {
    setAnalyzing(true);
    setSummary('');
    setError(null);

    try {
      const quotes = await Promise.all(
        watchlist.map(async (symbol) => {
          const q = await fetchQuote(symbol);
          return {
            symbol,
            price: q.c,
            change: q.d,
            changePercent: q.dp,
            open: q.o,
            high: q.h,
            low: q.l,
            prevClose: q.pc,
          };
        })
      );

      await analyzeMarket(quotes, {
        onChunk: (text) => setSummary((prev) => prev + text),
        onDone: () => setAnalyzing(false),
        onError: (msg) => { setError(msg); setAnalyzing(false); },
      });
    } catch (err) {
      setError(err.message);
      setAnalyzing(false);
    }
  }

  return (
    <div className="dashboard">
      <Header />
      <main>
        <div className="watchlist-header">
          <h2>Watchlist</h2>
          <button className="analyze-btn" onClick={handleAnalyze} disabled={analyzing}>
            {analyzing ? 'Analyzing…' : 'AI Analysis'}
          </button>
        </div>

        {SECTIONS.map((section) => (
          <div key={section.label} className="watchlist-section">
            <h3 className="section-label">{section.label}</h3>
            <div className="stock-grid">
              {section.symbols.map((symbol) => (
                <StockCard key={symbol} symbol={symbol} />
              ))}
            </div>
          </div>
        ))}

        <MarketSummary summary={summary} loading={analyzing} error={error} />
      </main>
    </div>
  );
}
