// index.js
require('dotenv').config();
const express = require('express');
const app = express();
const routes = require('./src/routes');

const PORT = process.env.PORT || 8080;

// Middlewares
app.use(express.json());

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: '🤖 Servidor Node.js + IBM watsonx.ai',
    version: '1.0.0',
    endpoints: {
      health:   'GET  /api/health',
      generate: 'POST /api/generate  → { prompt, model_id?, max_tokens? }',
      chat:     'POST /api/chat      → { messages: [{role, content}], model_id? }',
    },
  });
});

// Rotas da API
app.use('/api', routes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`🔑 API Key: ${process.env.WATSONX_API_KEY ? 'configurada' : '❌ NÃO configurada'}`);
  console.log(`📁 Project ID: ${process.env.WATSONX_PROJECT_ID ? 'configurado' : '❌ NÃO configurado'}`);
});
