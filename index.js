// index.js
// Variáveis de ambiente injetadas pelo IBM Code Engine — sem dotenv

const express = require('express');
const app = express();

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0';

const WATSONX_API_KEY  = process.env.WATSONX_API_KEY;
const WATSONX_URL      = process.env.WATSONX_URL;
const PROJECT_ID       = process.env.PROJECT_ID;

// Middleware
app.use(express.json());

// ──────────────────────────────────────────
// GET / — Rota raiz
// ──────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    app:     'mentoria-leveza',
    version: '1.0.0',
    status:  'online',
    endpoints: {
      health:   'GET  /api/health',
      generate: 'POST /api/generate → { prompt, model_id?, max_tokens? }',
      chat:     'POST /api/chat     → { messages: [{role, content}], model_id? }',
    },
  });
});

// ──────────────────────────────────────────
// GET /api/health — Status das variáveis
// ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status:    'ok',
    timestamp: new Date().toISOString(),
    env: {
      WATSONX_API_KEY: WATSONX_API_KEY ? '✅ configurada' : '❌ ausente',
      WATSONX_URL:     WATSONX_URL     ? '✅ configurada' : '❌ ausente',
      PROJECT_ID:      PROJECT_ID      ? '✅ configurado' : '❌ ausente',
    },
  });
});

// ──────────────────────────────────────────
// POST /api/generate — Geração de texto
// ──────────────────────────────────────────
app.post('/api/generate', async (req, res) => {
  const { prompt, model_id, max_tokens } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'O campo "prompt" é obrigatório.' });
  }

  try {
    const response = await fetch(
      `${WATSONX_URL}/ml/v1/text/generation?version=2023-05-29`,
      {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${WATSONX_API_KEY}`,
        },
        body: JSON.stringify({
          model_id:   model_id || 'ibm/granite-13b-chat-v2',
          project_id: PROJECT_ID,
          input:      prompt,
          parameters: {
            max_new_tokens: max_tokens || 200,
            temperature:    0.7,
          },
        }),
      }
    );

    const data   = await response.json();
    const result = data?.results?.[0]?.generated_text || '';
    return res.json({ success: true, result });

  } catch (err) {
    console.error('Erro /api/generate:', err.message);
    return res.status(500).json({
      error:   'Erro ao chamar IBM watsonx.ai',
      details: err.message,
    });
  }
});

// ──────────────────────────────────────────
// POST /api/chat — Chat com histórico
// ──────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const { messages, model_id } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'O campo "messages" deve ser um array.' });
  }

  const prompt =
    messages
      .map(m => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`)
      .join('\n') + '\nAssistente:';

  try {
    const response = await fetch(
      `${WATSONX_URL}/ml/v1/text/generation?version=2023-05-29`,
      {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${WATSONX_API_KEY}`,
        },
        body: JSON.stringify({
          model_id:   model_id || 'ibm/granite-13b-chat-v2',
          project_id: PROJECT_ID,
          input:      prompt,
          parameters: {
            max_new_tokens:   300,
            temperature:      0.7,
            stop_sequences:   ['\nUsuário:'],
          },
        }),
      }
    );

    const data  = await response.json();
    const reply = data?.results?.[0]?.generated_text?.trim() || '';
    return res.json({ success: true, reply });

  } catch (err) {
    console.error('Erro /api/chat:', err.message);
    return res.status(500).json({
      error:   'Erro ao chamar IBM watsonx.ai',
      details: err.message,
    });
  }
});

// ──────────────────────────────────────────
// Iniciar servidor
// ──────────────────────────────────────────
app.listen(PORT, HOST, () => {
  console.log('─────────────────────────────────────');
  console.log(`🚀 mentoria-leveza iniciado`);
  console.log(`📡 Escutando em http://${HOST}:${PORT}`);
  console.log(`🔑 WATSONX_API_KEY : ${WATSONX_API_KEY ? '✅ ok' : '❌ ausente'}`);
  console.log(`🌐 WATSONX_URL     : ${WATSONX_URL     ? '✅ ok' : '❌ ausente'}`);
  console.log(`📁 PROJECT_ID      : ${PROJECT_ID      ? '✅ ok' : '❌ ausente'}`);
  console.log('─────────────────────────────────────');
});
