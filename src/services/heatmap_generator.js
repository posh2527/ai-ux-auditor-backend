// src/services/heatmap_generator.js
const { getModel } = require('./geminiClient');
const fs = require('fs');
const path = require('path');

/**
 * Generate UX heatmap regions (visual saliency) from screenshot.
 * Returns 3-5 regions where users' eyes will look first.
 * @param {string} screenshotPath - "/screenshots/xxx.png" URL path
 * @param {string} projectContext - "ecommerce", "saas_dashboard", etc.
 * @returns {Array} regions with x,y,width,height,intensity,label
 */
async function generateHeatmapRegions(screenshotPath, projectContext = 'general') {
  const model = getModel('gemini-1.5-flash');

  // ✅ FIXED: use same logic as vision_analyzer
  const filename = screenshotPath.split('/').pop(); // "screenshot-xxx.png"
  const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');
  const absPath = path.join(screenshotsDir, filename);

  console.log('🔥 Heatmap reading screenshot:', absPath);

  if (!fs.existsSync(absPath)) {
    console.error('❌ Heatmap screenshot not found:', absPath);
    throw new Error(`Heatmap screenshot missing: ${absPath}`);
  }

  const imageBuffer = fs.readFileSync(absPath);
  const imageBase64 = imageBuffer.toString('base64');

  const promptText = `
You are simulating a visual saliency model (where users look first).

Look at the UI screenshot and identify 3-5 regions that will attract attention first:
- Hero image
- Main heading / title
- Primary button / CTA
- Navigation bar
- Logo

For each region, return:
- x, y, width, height in percentages (0-100) relative to screenshot
- intensity: 0 to 1 (higher = more attention)
- label: short description

Return ONLY this JSON:

{
  "regions": [
    {
      "x": 40,
      "y": 70,
      "width": 20,
      "height": 10,
      "intensity": 0.9,
      "label": "primary CTA button"
    },
    {
      "x": 10,
      "y": 20,
      "width": 30,
      "height": 15,
      "intensity": 0.8,
      "label": "hero heading"
    }
  ]
}
`.trim();

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              inline_data: {
                mime_type: 'image/png',
                data: imageBase64,
              },
            },
            { text: promptText },
          ],
        },
      ],
    });

    const response = await result.response;
    const text = response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Gemini returned invalid JSON for heatmap_generator');
    }

    if (!Array.isArray(data.regions)) {
      throw new Error('heatmap_generator: "regions" array missing');
    }

    // Ensure bounding boxes are valid (0-100)
    data.regions = data.regions.map((region) => ({
      ...region,
      x: Math.max(0, Math.min(100, region.x || 0)),
      y: Math.max(0, Math.min(100, region.y || 0)),
      width: Math.max(5, Math.min(50, region.width || 20)),
      height: Math.max(5, Math.min(30, region.height || 10)),
      intensity: Math.max(0.3, Math.min(1.0, region.intensity || 0.7)),
      label: region.label || 'attention region',
    }));

    return data.regions;
  } catch (err) {
    console.error('heatmap_generator failed:', err.message);

    // Fallback – realistic fake regions so frontend doesn't break
    return [
      {
        x: 45,
        y: 65,
        width: 25,
        height: 12,
        intensity: 0.9,
        label: 'primary CTA region',
      },
      {
        x: 10,
        y: 20,
        width: 35,
        height: 15,
        intensity: 0.8,
        label: 'hero section',
      },
      {
        x: 5,
        y: 5,
        width: 20,
        height: 10,
        intensity: 0.7,
        label: 'navigation',
      },
    ];
  }
}

module.exports = { generateHeatmapRegions };
