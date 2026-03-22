import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function WorldLens() {
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
    <div className="world-lens">
      <header>
        <div className="world-lens-title-row">
          <h1>WorldLens</h1>
          <span className="world-lens-badge">Geopolitical Intelligence</span>
        </div>
        <p className="world-lens-subtitle">
          AI-powered briefing on US-Japan relations, Japanese markets, and global geopolitical events.
        </p>
      </header>

      <div className="world-lens-action">
        <button className="analyze-btn" onClick={fetchBriefing} disabled={loading}>
          {loading ? 'Fetching briefing…' : 'Get Briefing'}
        </button>
      </div>

      {(briefing || loading || error) && (
        <div className="market-summary world-lens-briefing">
          <div className="summary-header">
            <span className="summary-label">AI Briefing</span>
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

      {!briefing && !loading && !error && (
        <div className="world-lens-topics">
          {[
            { icon: '🇺🇸🇯🇵', label: 'US-Japan Relations', desc: 'Trade, diplomacy, security alliances' },
            { icon: '📈', label: 'Japan Markets', desc: 'Nikkei, yen, economic indicators' },
            { icon: '🌐', label: 'Global Geopolitics', desc: 'Conflicts, sanctions, world economy' },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="world-lens-topic-card">
              <span className="topic-icon">{icon}</span>
              <div>
                <div className="topic-label">{label}</div>
                <div className="topic-desc">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
