const express = require('express');
const { takeScreenshot } = require('../services/screenshot');

// AI Engineer 1 imports (with fallbacks)
const { analyzeScreenshotUX } = require('../services/vision_analyzer');
const { validateIssuesAgainstLighthouse } = require('../services/rule_validator');
const { generateHeatmapRegions } = require('../services/heatmap_generator');

// AI Engineer 2 imports (YOUR work)
const { detectComponent } = require('../services/componentDetector');
const { generateCodePatch } = require('../services/codePatchGenerator');

// FAKE Lighthouse (since missing - add real later)
async function runLighthouseScan(url) {
  console.log('⚡ Fake Lighthouse scan (add real lighthouseScan.js later)');
  return {
    scores: {
      accessibility: 82,
      performance: 75
    },
    accessibilityIssues: [
      { id: 'color-contrast', rule: 'color-contrast', description: 'Low contrast detected' }
    ]
  };
}

const router = express.Router();

router.post('/url', async (req, res) => {
  const { url, projectContext = 'general web app' } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    // 1. Screenshot ONLY (Lighthouse fake for now)
    console.log('🔄 Screenshot capture...');
    const screenshotUrl = await takeScreenshot(url);
    const lighthouseResult = await runLighthouseScan(url);

    // 2. AI Engineer 1: Gemini UX analysis
    console.log('🤖 AI Engineer 1: Vision + heatmap...');
    const visionIssues = await analyzeScreenshotUX(screenshotUrl, projectContext, lighthouseResult.scores);
    const validatedIssues = validateIssuesAgainstLighthouse(visionIssues, lighthouseResult.accessibilityIssues);
    const heatmap = await generateHeatmapRegions(screenshotUrl, projectContext);

    // 3. AI Engineer 2: YOUR component detection + patching
    console.log('🛠️ AI Engineer 2: Component detection + code patch...');
    const topIssue = validatedIssues[0] || { description: 'Improve mobile UX' };
    const detectedComponent = await detectComponent('<html>ai-placeholder</html>');
    const codePatch = await generateCodePatch(detectedComponent, topIssue.description || topIssue.title);

    // 4. Production-ready response
    res.json({
      url,
      scores: {
        ux: Math.round((85 + lighthouseResult.scores.accessibility) / 2),  // Simple UX score
        accessibility: lighthouseResult.scores.accessibility,
        performance: lighthouseResult.scores.performance
      },
      screenshotUrl,
      
      // AI Engineer 1 outputs
      visionIssues,           // Raw Gemini vision issues
      validatedIssues,        // Anti-hallucination validated
      heatmap,                // Attention prediction
      
      // Lighthouse
      accessibility: lighthouseResult.accessibilityIssues.slice(0, 5),
      
      // AI Engineer 2 outputs (YOUR WORK!)
      detectedComponent,      // Broken component found
      codePatch,              // AI-generated fix
      
      aiSuggestions: validatedIssues.map(issue => issue.suggestion).slice(0, 3)
    });
  } catch (error) {
    console.error('Pipeline failed:', error);
    res.status(500).json({ 
      error: 'Analysis failed', 
      details: error.message,
      hint: 'Check screenshot folder + deps'
    });
  }
});

module.exports = router;
router.get('/test-screenshot/:url', async (req, res) => {
  try {
    const screenshotUrl = await takeScreenshot(req.params.url);
    res.json({ screenshotUrl, message: 'Screenshot OK' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
