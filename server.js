import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

app.listen(3001, () => console.log('API server running on http://localhost:3001'));
