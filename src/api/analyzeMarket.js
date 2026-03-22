/**
 * Sends stock data to the Express proxy → Claude API.
 * Calls onChunk(text) for each streamed token, onDone() when complete.
 */
export async function analyzeMarket(stocks, { onChunk, onDone, onError }) {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stocks }),
  });

  if (!res.ok) {
    onError(`Server error: ${res.status}`);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const lines = decoder.decode(value).split('\n');
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6);
      if (payload === '[DONE]') { onDone(); return; }
      try {
        const { text, error } = JSON.parse(payload);
        if (error) { onError(error); return; }
        if (text) onChunk(text);
      } catch {
        // ignore malformed chunks
      }
    }
  }
}
