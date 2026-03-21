import Header from '../components/layout/Header';
import StockCard from '../components/widgets/StockCard';
import { useWatchlist } from '../store/watchlistStore';

export default function Dashboard() {
  const { watchlist } = useWatchlist();

  return (
    <div className="dashboard">
      <Header />
      <main>
        <h2>Watchlist</h2>
        <div className="stock-grid">
          {watchlist.map((symbol) => (
            <StockCard key={symbol} symbol={symbol} />
          ))}
        </div>
      </main>
    </div>
  );
}
