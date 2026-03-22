import { useState } from 'react';
import './App.css';
import { WatchlistProvider } from './store/watchlistStore';
import Dashboard from './pages/Dashboard';
import WorldLens from './pages/WorldLens';

export default function App() {
  const [page, setPage] = useState('dashboard');

  return (
    <WatchlistProvider>
      <nav className="app-nav">
        <span className="app-nav-brand">Market</span>
        <div className="app-nav-tabs">
          <button
            className={`nav-tab${page === 'dashboard' ? ' active' : ''}`}
            onClick={() => setPage('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`nav-tab${page === 'worldlens' ? ' active' : ''}`}
            onClick={() => setPage('worldlens')}
          >
            WorldLens
          </button>
        </div>
      </nav>
      {page === 'dashboard' ? <Dashboard /> : <WorldLens />}
    </WatchlistProvider>
  );
}
