import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import NewsSection from '../components/NewsSection';

export default function News() {
  const [briefing, setBriefing] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  async function fetchBriefing() {
    setBriefing('');
    setError(null);
    setDone(false);
    setLoading(true);

    try {
      const res = await fetch('/api/world-lens', { method: 'POST' });
      if (!res.ok) {
        let msg = `Server error ${res.status}`;
        try { const d = await res.json(); msg = d.error || msg; } catch {}
        throw new Error(msg);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6);
          if (payload === '[DONE]') { setDone(true); continue; }
          try {
            const { text, error: errText } = JSON.parse(payload);
            if (errText) throw new Error(errText);
            if (text) setBriefing((prev) => prev + text);
          } catch (e) {
            if (e.message !== 'Unexpected end of JSON input') throw e;
          }
        }
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="news-page">
      <header className="news-page-header">
        <div>
          <h1>News</h1>
          <p className="news-page-subtitle">
            Live headlines across markets, currency, and Japan politics.
          </p>
        </div>
      </header>

      <div className="news-grid">
        <NewsSection
          label="Market Headlines"
          query="Japan US stock market economy Nikkei finance"
        />
        <NewsSection
          label="JPY / USD"
          query="JPY USD yen dollar exchange rate currency Bank of Japan"
        />
        <NewsSection
          label="Japan Politics"
          query="Japan politics government LDP prime minister Kishida policy"
        />
      </div>

      <div className="news-briefing-section">
        <div className="news-briefing-header">
          <div>
            <span className="section-label" style={{ margin: 0 }}>AI Briefing</span>
            <p className="news-briefing-desc">
              Claude synthesizes the headlines above into a structured intelligence summary.
            </p>
          </div>
          <button className="analyze-btn" onClick={fetchBriefing} disabled={loading}>
            {loading ? 'Generating…' : 'Get Briefing'}
          </button>
        </div>

        {(briefing || loading || error) && (
          <div className="news-briefing-result">
            <div className="summary-header">
              <span className="summary-label">Summary</span>
              <span className="summary-model">claude-sonnet-4</span>
            </div>
            {error && <p className="summary-error">{error}</p>}
            {!error && briefing && (
              <div className="summary-text">
                <ReactMarkdown>{briefing}</ReactMarkdown>
                {!done && <span className="summary-cursor" />}
              </div>
            )}
            {!error && !briefing && loading && (
              <div className="summary-skeleton">
                <span className="summary-cursor" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
