require('dotenv').config();
console.log('🔑 Gemini key loaded:', process.env.GEMINI_API_KEY ? 'YES' : 'NO');

// Express setup
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import the /analyze/url router
const analyzeUrlRouter = require('./src/routes/analyzeUrl');

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Bigger for screenshots

// ✅ FIX 1: Serve screenshots from public/screenshots
app.use('/screenshots', express.static(path.join(__dirname, 'public/screenshots')));
app.use('/static', express.static(path.join(__dirname, 'public'))); // General static

// ✅ FIX 2: Health check + root
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'AI UX Auditor backend running 🚀',
    endpoints: {
      analyze: 'POST /analyze/url {url: "..."}',
      test: 'GET /analyze/test-screenshot/:url'
    }
  });
});

app.get('/', (req, res) => {
  res.json({ 
    welcome: 'AI UX Auditor v2.0 - Multi‑input UX Analysis',
    docs: 'POST /analyze/url with {url, projectType, framework}'
  });
});

// ✅ Analyze URL routes (POST /analyze/url)
app.use('/analyze', analyzeUrlRouter);

app.listen(PORT, () => {
  console.log(`✅ Server listening → http://localhost:${PORT}`);
  console.log(`📸 Screenshots → http://localhost:${PORT}/screenshots/`);
  console.log(`🧪 Test → http://localhost:${PORT}/health`);
});
