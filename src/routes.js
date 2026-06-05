// src/routes.js
const express = require('express');
const router = express.Router();
const { getClient } = require('./watsonxClient');

// GET /api/health - Verifica status do servidor
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    watsonx_url: process.env.WATSONX_URL,
    project_id: process.env.WATSONX_PROJECT_ID ? '✅ configurado' : '❌ não configurado',
    api_key: process.env.WATSONX_API_KEY ? '✅ configurado' : '❌ não configurado',
  });
});

// POST /api/generate - Gera texto com watsonx
router.post('/generate', async (req, res) => {
  const { prompt, model_id, max_tokens } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'O campo "prompt" é obrigatório.' });
  }

  try {
    const client = getClient();

    const response = await client.generateText({
      modelId: model_id || 'ibm/granite-13b-chat-v2',
      projectId: process.env.WATSONX_PROJECT_ID,
      input: prompt,
      parameters: {
        max_new_tokens: max_tokens || 200,
        temperature: 0.7,
      },
    });

    const generated = response.result.results[0].generated_text;
    return res.json({ success: true, result: generated });

  } catch (err) {
    console.error('Erro watsonx:', err.message);
    return res.status(500).json({ error: 'Erro ao chamar IBM watsonx.ai', details: err.message });
  }
});

// POST /api/chat - Chat com histórico de mensagens
router.post('/chat', async (req, res) => {
  const { messages, model_id } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'O campo "messages" deve ser um array.' });
  }

  // Monta histórico como prompt
  const prompt = messages
    .map(m => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`)
    .join('\n') + '\nAssistente:';

  try {
    const client = getClient();

    const response = await client.generateText({
      modelId: model_id || 'ibm/granite-13b-chat-v2',
      projectId: process.env.WATSONX_PROJECT_ID,
      input: prompt,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.7,
        stop_sequences: ['\nUsuário:'],
      },
    });

    const reply = response.result.results[0].generated_text.trim();
    return res.json({ success: true, reply });

  } catch (err) {
    console.error('Erro watsonx chat:', err.message);
    return res.status(500).json({ error: 'Erro ao chamar IBM watsonx.ai', details: err.message });
  }
});

module.exports = router;
