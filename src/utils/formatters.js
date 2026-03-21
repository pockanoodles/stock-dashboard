export const formatCurrency = (value, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);

export const formatPercent = (value) =>
  `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

export const formatLargeNumber = (value) =>
  new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value);
