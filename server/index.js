import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const candidates = [
    path.join(__dirname, '.env'),
    path.join(process.cwd(), '.env'),
  ];
  for (const envPath of candidates) {
    if (!existsSync(envPath)) continue;
    const raw = readFileSync(envPath, 'utf8').replace(/^\uFEFF/, '');
    Object.assign(process.env, dotenv.parse(raw));
    return envPath;
  }
  return null;
}

const loadedFrom = loadEnv();
const apiKey = (process.env.OPENAI_API_KEY || '').trim();
const openai = apiKey ? new OpenAI({ apiKey }) : null;
if (!openai) {
  console.warn('OPENAI_API_KEY not set.', loadedFrom ? `Loaded .env from ${loadedFrom}` : 'No .env found in server dir or cwd.');
}

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text is required' });
  }

  if (!openai) {
    return res.status(503).json({
      error: 'Chat is not configured. Create a .env file in the server folder with: OPENAI_API_KEY=sk-your-key',
    });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: text.trim() }],
    });

    const reply =
      completion.choices?.[0]?.message?.content?.trim() ||
      'No response from the model.';

    res.json({ reply });
  } catch (err) {
    const status = err.status ?? 500;
    let message = err.message || err.error?.message || 'Request to ChatGPT failed';
    if (status === 429) {
      message = 'OpenAI quota exceeded. Check your plan and billing at platform.openai.com';
    }
    res.status(status).json({ error: message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
