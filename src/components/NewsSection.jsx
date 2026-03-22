import { useState, useEffect } from 'react';

function timeAgo(iso) {
  const mins = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NewsSection({ label, query }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/news?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setArticles(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [query]);

  return (
    <div className="news-section-card">
      <div className="news-section-header">
        <span className="section-label" style={{ margin: 0 }}>{label}</span>
        <button className="news-refresh-btn" onClick={load} disabled={loading}>
          {loading ? '···' : 'Refresh'}
        </button>
      </div>

      {error && <p className="news-error">{error}</p>}

      <ul className="news-list">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="news-item news-item--skeleton">
                <span className="news-skeleton-line" style={{ width: `${55 + (i % 3) * 15}%` }} />
                <span className="news-skeleton-line" style={{ width: '30%', height: '10px', marginTop: '4px' }} />
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
    </div>
  );
}
