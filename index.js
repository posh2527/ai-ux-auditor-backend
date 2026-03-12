require('dotenv').config();
console.log('Gemini key loaded:', process.env.GEMINI_API_KEY ? 'YES' : 'NO');
require('dotenv').config(); // Add this line first


// ... rest of your code
const express = require('express');
const cors = require('cors');
const path = require('path');

// import the /analyze/url router
const analyzeUrlRouter = require('./src/routes/analyzeUrl');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// serve static files (screenshots) from /public
app.use(express.static('public'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI UX Auditor backend running' });
});

// Analyze URL routes
// Full path will be: POST /analyze/url
app.use('/analyze', analyzeUrlRouter);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
