const { getModel } = require('./geminiClient');
const fs = require('fs');
const path = require('path');

/**
 * Analyze screenshot for UX + accessibility issues with bounding boxes for red highlights.
 * @param {string} screenshotPath - "/screenshots/xxx.png"
 * @param {string} projectContext - "ecommerce", "saas_dashboard", etc.
 * @param {object} lighthouseData - lighthouse result
 */
async function analyzeScreenshotUX(screenshotPath, projectContext, lighthouseData) {
  const model = getModel('gemini-1.5-flash');

  // ✅ FIXED: Correctly extract filename and build absolute path
  const filename = screenshotPath.split('/').pop();  // "screenshot-xxx.png"
  const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');
  const absPath = path.join(screenshotsDir, filename);
  
  console.log('🔍 Vision analyzing screenshot:', absPath);

  // ✅ Check file exists before reading
  if (!fs.existsSync(absPath)) {
    console.error('❌ Screenshot not found:', absPath);
    throw new Error(`Screenshot missing: ${absPath}`);
  }

  const imageBuffer = fs.readFileSync(absPath);
  const imageBase64 = imageBuffer.toString('base64');

  const promptText = `
You are a senior UX + accessibility auditor using Nielsen heuristics and WCAG.

Context:
- Project type: ${projectContext || 'general web app'}
- Lighthouse summary: ${JSON.stringify(lighthouseData || {}, null, 2)}

TASK:
1. Look at the UI screenshot.
2. Find 3-7 UX and accessibility issues.
3. For each issue, return:
   - id: string
   - type: "ux" or "accessibility"
   - title: short summary
   - severity: "low" | "medium" | "high"
   - description: one or two sentences
   - suggestion: specific fix
   - componentName: e.g. "Navbar", "Hero", "Primary button"
   - boundingBox: { x, y, width, height } in percentages 0–100 relative to screenshot.

Return ONLY this JSON:

{
  "issues": [
    {
      "id": "ux1",
      "type": "ux",
      "title": "Primary CTA not prominent",
      "severity": "high",
      "description": "Main call-to-action blends into background.",
      "suggestion": "Increase size and contrast of primary CTA button.",
      "componentName": "Primary CTA button",
      "boundingBox": { "x": 40, "y": 70, "width": 20, "height": 10 }
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
      throw new Error('Gemini returned invalid JSON for vision_analyzer');
    }

    if (!Array.isArray(data.issues)) {
      throw new Error('vision_analyzer: "issues" array missing');
    }

    console.log(`✅ Vision found ${data.issues.length} issues`);
    return data.issues;
  } catch (err) {
    console.error('vision_analyzer failed:', err.message);

    // Fallback – never break demo
    return [
      {
        id: 'ux-fallback-1',
        type: 'ux',
        title: 'Generic UX issue',
        severity: 'medium',
        description: 'AI analysis unavailable, using fallback.',
        suggestion: 'Improve navigation clarity and button contrast.',
        componentName: 'Layout',
        boundingBox: { x: 30, y: 60, width: 40, height: 15 },
      },
    ];
  }
}

module.exports = { analyzeScreenshotUX };
