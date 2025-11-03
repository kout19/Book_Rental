import fetch from 'node-fetch';

export const askAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: 'Missing prompt' });
    if (!process.env.OPENAI_API_KEY) {
      // simple mock: echo back
      return res.status(200).json({ answer: `Mock assistant: I received your question: ${prompt}` });
    }

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: prompt }], max_tokens: 300 })
    });
    const j = await resp.json();
    const answer = j?.choices?.[0]?.message?.content || 'No answer';
    res.status(200).json({ answer });
  } catch (err) {
    console.error('AI ask error', err);
    res.status(500).json({ message: 'AI error', error: err.message });
  }
};

export default { askAI };
