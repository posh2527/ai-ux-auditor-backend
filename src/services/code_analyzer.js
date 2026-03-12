// src/services/code_analyzer.js
const { getModel } = require('./geminiClient');

/**
 * Analyze raw HTML/React/Tailwind code for accessibility issues.
 * @param {string} code - HTML/React/Tailwind snippet
 * @param {string} framework - "html", "react", "tailwind"
 */
async function analyzeCodeAccessibility(code, framework = 'html/tailwind') {
  const model = getModel('gemini-1.5-flash');

  const promptText = `
You are an accessibility auditor.

Framework: ${framework}

Analyze ONLY this code for accessibility problems:
\`\`\`
${code}
\`\`\`

Focus on:
- missing alt text on images
- missing labels on inputs
- missing aria-label/aria-labelledby on icon-only buttons
- incorrect heading hierarchy
- non-keyboard-focusable clickable elements

Return ONLY this JSON:

{
  "issues": [
    {
      "id": "code1",
      "rule": "missing-aria-label",
      "description": "Icon-only button missing accessible name.",
      "severity": "high",
      "fix": "Add aria-label describing the button action.",
      "lineHint": "button with only an icon"
    }
  ]
}
`.trim();

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
    });

    const response = await result.response;
    const text = response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Gemini returned invalid JSON for code_analyzer');
    }

    if (!Array.isArray(data.issues)) {
      throw new Error('code_analyzer: "issues" array missing');
    }

    return data.issues;
  } catch (err) {
    console.error('code_analyzer failed:', err.message);

    // Fallback – never break demo
    return [
      {
        id: 'code-fallback-1',
        rule: 'generic-accessibility-check',
        description:
          'AI unavailable; manually review alt text, labels, roles, keyboard focus.',
        severity: 'medium',
        fix: 'Ensure all interactive elements are reachable and named.',
        lineHint: null,
      },
    ];
  }
}

module.exports = { analyzeCodeAccessibility };