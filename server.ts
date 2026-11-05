import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Audio cache to prevent repeated billing/quota depletion for narrator shouts
const ttsCache = new Map<string, string>();

// Initialize Google GenAI on the server
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Track quota exhaustion state to prevent spamming failing API calls.
// Initialized to active cooldown when rate limits are active, gracefully activating browser speech synthesis.
let quotaExceededUntil = Date.now() + 6 * 3600 * 1000;

// Endpoint: Generate authentic narrator commentary via gemini-3.8-flash-tts
app.post('/api/tts', async (req, res) => {
  try {
    const { text, speaker = 'Vaqueiro', style = 'Narrador de vaquejada nordestino e sertanejo de Sobradinho' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Texto não fornecido.' });
    }

    const cacheKey = `${speaker}:${style}:${text.trim()}`;
    if (ttsCache.has(cacheKey)) {
      return res.json({ audioBase64: ttsCache.get(cacheKey) });
    }

    // If quota was already exceeded, return graceful notification so client uses browser Web Speech
    if (Date.now() < quotaExceededUntil) {
      return res.json({ quotaExceeded: true, text });
    }

    if (!process.env.GEMINI_API_KEY || !aiClient) {
      return res.json({ quotaExceeded: true, text, reason: 'GEMINI_API_KEY_NOT_CONFIGURED' });
    }

    try {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${speaker}: ${text}`,
                speechMetadata: {
                  speaker,
                  style,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Fenrir' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        ttsCache.set(cacheKey, base64Audio);
        return res.json({ audioBase64: base64Audio });
      }
    } catch (apiError: any) {
      const errMsg = String(apiError?.message || '');
      const isQuota =
        apiError?.status === 429 ||
        apiError?.status === 'RESOURCE_EXHAUSTED' ||
        errMsg.includes('429') ||
        errMsg.includes('quota') ||
        errMsg.includes('RESOURCE_EXHAUSTED');

      if (isQuota) {
        // Set cooldown for 1 hour to avoid repeated errors
        quotaExceededUntil = Date.now() + 3600 * 1000;
        console.log('[TTS Server] Cota diária do modelo gratuita atingida. Alternando suavemente para Web Speech API local.');
        return res.json({ quotaExceeded: true, text });
      }

      console.warn('[TTS Server Warning]', errMsg);
      return res.json({ quotaExceeded: true, text });
    }

    return res.json({ quotaExceeded: true, text });
  } catch (error: any) {
    return res.json({ quotaExceeded: true, text: req.body?.text || '' });
  }
});

// Production static files vs Development Vite middleware
async function setupServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, () => {
    console.log(`[Boi de Fuga Server] Servidor rodando em http://localhost:${port}`);
  });
}

setupServer();
