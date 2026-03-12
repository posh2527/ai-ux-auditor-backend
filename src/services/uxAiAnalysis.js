require('dotenv').config();

async function runUxAiAnalysis(url, screenshotUrl, lighthouseScores) {
  // Fallback for now (add real AI later)
  console.log('AI Analysis: using fallback (add real Gemini/OpenAI key)');

  return {
    uxScore: 78,
    issues: [
      {
        id: 1,
        type: "ux",
        title: "Navigation discoverability low",
        severity: "high",
        description: "Main navigation not immediately visible",
        suggestion: "Move primary nav to fixed top header",
        componentName: "Navbar"
      },
      {
        id: 2,
        type: "ux",
        title: "CTA button small on mobile",
        severity: "medium",
        description: "Primary action too small for touch",
        suggestion: "Increase to minimum 44px height/width",
        componentName: "PrimaryButton"
      }
    ],
    aiSuggestions: [
      "Use 4.5:1 contrast ratio for all text",
      "Add clear visual hierarchy with spacing",
      "Test on mobile viewport sizes"
    ]
  };
}

module.exports = { runUxAiAnalysis };
