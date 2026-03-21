import './App.css';
import { WatchlistProvider } from './store/watchlistStore';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <WatchlistProvider>
      <Dashboard />
    </WatchlistProvider>
  );
}
