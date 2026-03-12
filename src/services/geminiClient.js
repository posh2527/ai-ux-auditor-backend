// src/services/geminiClient.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠ GEMINI_API_KEY missing in .env – AI will use fallback data');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key');

function getModel(modelName = 'gemini-1.5-flash') {
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json', // STRICT JSON MODE
    },
  });
}

module.exports = { getModel };