// index.js
// require('dotenv').config(); // ❌ Removido: não usar .env no IBM Code Engine
                               // ✅ As variáveis são injetadas pelo próprio Code Engine

const express = require('express');
const app = express();
const routes = require('./src/routes');

const PORT = process.env.PORT || 8080;
const HOST = '0.0.0.0'; // ✅ Escuta em todas as interfaces de rede

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

// Iniciar servidor — HOST 0.0.0.0 obrigatório no IBM Code Engine
app.listen(PORT, HOST, () => {
  console.log(`✅ Servidor rodando em http://${HOST}:${PORT}`);
  console.log(`🔑 API Key:    ${process.env.WATSONX_API_KEY  ? '✅ configurada'  : '❌ NÃO configurada'}`);
  console.log(`📁 Project ID: ${process.env.WATSONX_PROJECT_ID ? '✅ configurado' : '❌ NÃO configurado'}`);
  console.log(`🌐 URL:        ${process.env.WATSONX_URL       ? '✅ configurada'  : '❌ NÃO configurada'}`);
});
