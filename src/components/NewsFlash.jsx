import { useState, useEffect } from 'react';

function timeAgo(iso) {
  const mins = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NewsFlash() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/news');
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setArticles(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="news-flash">
      <div className="news-flash-header">
        <span className="section-label" style={{ margin: 0 }}>News Flash</span>
        <button className="news-refresh-btn" onClick={load} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error && <p className="news-error">{error}</p>}

      {!error && (
        <ul className="news-list">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="news-item news-item--skeleton">
                  <span className="news-skeleton-line" style={{ width: `${60 + (i % 3) * 15}%` }} />
                </li>
              ))
            : articles.map((a, i) => (
                <li key={i} className="news-item">
                  <a href={a.url} target="_blank" rel="noreferrer" className="news-title">
                    {a.title}
                  </a>
                  <span className="news-meta">
                    {a.source} · {timeAgo(a.publishedAt)}
                  </span>
                </li>
              ))}
        </ul>
      )}
    </div>
  );
}
