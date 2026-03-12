const express = require('express');
const { takeScreenshot } = require('../services/screenshot');

// AI Engineer 1 imports
const analyzeScreenshotUX = require('../services/vision_analyzer');
const { validateIssuesAgainstLighthouse } = require('../services/rule_validator');
const generateHeatmapRegions = require('../services/heatmap_generator');

// AI Engineer 2 imports
const detectComponent = require('../services/componentDetector');
const generateCodePatch = require('../services/codePatchGenerator');

// Fake Lighthouse
async function runLighthouseScan(url) {
  return {
    scores: { accessibility: 82, performance: 75 },
    accessibilityIssues: [{ id: 'color-contrast', rule: 'color-contrast', description: 'Low contrast detected' }]
  };
}

// ✅ ROUTER (FIXED!)
const router = express.Router();

// URL endpoint (existing)
router.post('/url', async (req, res) => {
  // ... your existing code (keep as-is)
});

// ✅ NEW MULTI-INPUT (for 10 features)
router.post('/multi', async (req, res) => {
  const { type, url, screenshotB64, code, projectType = 'general', framework = 'html' } = req.body;
  
  try {
    let screenshotUrl;
    
    if (type === 'url') {
      screenshotUrl = await takeScreenshot(url);
    } else if (screenshotB64) {
      screenshotUrl = await saveScreenshotB64(screenshotB64); // Add this helper if needed
    }
    
    const lighthouseResult = await runLighthouseScan(url);
    const visionIssues = await analyzeScreenshotUX(screenshotUrl, projectType, lighthouseResult.scores);
    const validatedIssues = validateIssuesAgainstLighthouse(visionIssues, lighthouseResult.accessibilityIssues);
    const heatmap = await generateHeatmapRegions(screenshotUrl, projectType);
    
    res.json({
      screenshotUrl,
      scores: { ux: 85, accessibility: lighthouseResult.scores.accessibility },
      issues: validatedIssues,
      heatmap,
      codePatch: "/* AI Fixed: <button class='px-6 py-3 bg-blue-500'>Fixed CTA</button> */"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test
router.get('/test-screenshot/:url', async (req, res) => {
  try {
    const screenshotUrl = await takeScreenshot(req.params.url);
    res.json({ screenshotUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
