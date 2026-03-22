import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const worldLensClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post('/api/analyze', async (req, res) => {
  const { stocks } = req.body;

  if (!stocks?.length) {
    return res.status(400).json({ error: 'No stock data provided' });
  }

  const stockLines = stocks
    .map(({ symbol, price, change, changePercent, open, high, low, prevClose }) =>
      `${symbol}: $${price.toFixed(2)} | Change: ${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}% ($${change.toFixed(2)}) | Open: $${open.toFixed(2)} | High: $${high.toFixed(2)} | Low: $${low.toFixed(2)} | Prev Close: $${prevClose.toFixed(2)}`
    )
    .join('\n');

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a financial analyst. Given the following real-time stock data, provide a concise market summary (3–4 short paragraphs). Highlight notable price movements, compare relative performance across the stocks, and share any patterns or takeaways worth noting. Be direct and data-driven.\n\nStock data:\n${stockLines}`,
        },
      ],
    });

    stream.on('text', (text) => {
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    });

    stream.on('finalMessage', () => {
      res.write('data: [DONE]\n\n');
      res.end();
    });

    stream.on('error', (err) => {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    });
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

app.get('/api/news', async (req, res) => {
  const key = process.env.VITE_NEWS_API_KEY;
  if (!key) return res.status(500).json({ error: 'VITE_NEWS_API_KEY not configured' });

  const q = req.query.q || 'Japan US stock market economy finance';

  try {
    const r = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=en&pageSize=6&sortBy=publishedAt&apiKey=${key}`
    );
    const json = await r.json();
    const articles = (json.articles || []).map((a) => ({
      title: a.title,
      source: a.source?.name,
      url: a.url,
      publishedAt: a.publishedAt,
    }));
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const YAHOO_RANGE_MAP = { '1M': '1mo', '3M': '3mo', '6M': '6mo', '1Y': '1y' };

app.get('/api/candles/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const range = YAHOO_RANGE_MAP[req.query.range] || '6mo';
  const interval = req.query.range === '1Y' ? '1wk' : '1d';

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const json = await r.json();

    const result = json?.chart?.result?.[0];
    if (!result) return res.status(404).json({ error: 'No data' });

    const { timestamp, indicators } = result;
    const { close, high, low, volume } = indicators.quote[0];

    const points = timestamp
      .map((ts, i) => ({
        date: new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        close: close[i] ?? null,
        high: high[i] ?? null,
        low: low[i] ?? null,
        volume: volume[i] ?? null,
      }))
      .filter((p) => p.close !== null);

    res.json(points);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/world-lens', async (req, res) => {
  const NEWS_API_KEY = process.env.VITE_NEWS_API_KEY;
  if (!NEWS_API_KEY) {
    return res.status(500).json({ error: 'VITE_NEWS_API_KEY not configured' });
  }

  const queries = [
    { label: 'US-Japan Relations', q: 'US Japan relations trade diplomacy' },
    { label: 'Japan Markets', q: 'Japan stock market economy Nikkei yen' },
    { label: 'Global Geopolitics', q: 'geopolitical events global economy sanctions conflict' },
  ];

  try {
    const results = await Promise.all(
      queries.map(({ q }) =>
        fetch(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=en&pageSize=5&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`
        ).then((r) => r.json())
      )
    );

    const sections = queries.map(({ label }, i) => {
      const articles = (results[i].articles || []).slice(0, 5);
      const lines = articles.map((a) => `- ${a.title} (${a.source?.name || 'Unknown'})`).join('\n');
      return `### ${label}\n${lines || 'No articles found.'}`;
    });

    const newsText = sections.join('\n\n');

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = worldLensClient.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a geopolitical analyst providing a concise intelligence briefing. Based on the following recent news headlines, write a clean, structured briefing covering: (1) US-Japan relationship dynamics, (2) Japanese market conditions, and (3) notable global geopolitical developments. Keep it to 3–4 short paragraphs. Be analytical and direct.\n\nRecent Headlines:\n${newsText}`,
        },
      ],
    });

    stream.on('text', (text) => {
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    });

    stream.on('finalMessage', () => {
      res.write('data: [DONE]\n\n');
      res.end();
    });

    stream.on('error', (err) => {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log('API server running on http://localhost:3001'));
