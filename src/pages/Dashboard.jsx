import Header from '../components/layout/Header';
import { useWatchlist } from '../store/watchlistStore';

export default function Dashboard() {
  const { watchlist } = useWatchlist();

  return (
    <div className="dashboard">
      <Header />
      <main>
        <h2>Watchlist</h2>
        <ul>
          {watchlist.map((symbol) => (
            <li key={symbol}>{symbol}</li>
          ))}
        </ul>
      </main>
    </div>
  );
}
