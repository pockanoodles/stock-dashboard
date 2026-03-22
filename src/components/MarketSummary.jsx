export default function MarketSummary({ summary, loading, error }) {
  if (!loading && !summary && !error) return null;

  return (
    <div className="market-summary">
      <div className="summary-header">
        <span className="summary-label">AI Market Summary</span>
        <span className="summary-model">claude-sonnet-4</span>
      </div>
      {loading && !summary && (
        <div className="summary-skeleton">
          <span className="summary-cursor" />
        </div>
      )}
      {error && <p className="summary-error">{error}</p>}
      {summary && (
        <p className="summary-text">
          {summary}
          {loading && <span className="summary-cursor" />}
        </p>
      )}
    </div>
  );
}
