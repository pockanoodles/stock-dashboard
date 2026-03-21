import { formatCurrency, formatPercent } from '../../utils/formatters';

export default function StockCard({ symbol, price, change, changePercent }) {
  const isPositive = change >= 0;
  return (
    <div className={`stock-card ${isPositive ? 'positive' : 'negative'}`}>
      <span className="symbol">{symbol}</span>
      <span className="price">{formatCurrency(price)}</span>
      <span className="change">{formatPercent(changePercent)}</span>
    </div>
  );
}
