const axios = require('axios');

async function generateCodePatch(brokenComponentCode, issueReason, framework = 'tailwind') {
  const prompt = `
Fix this component code using ${framework}:

BROKEN CODE:
${brokenComponentCode}

UX ISSUE: ${issueReason}

Rewrite ONLY this component. DO NOT rewrite the whole page. ONLY rewrite the <button> or <div>.

Return ONLY valid HTML:

<div class="fixed-button bg-blue-600 px-6 py-3 rounded-lg">Fixed</div>
`;

  try {
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-coder',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const result = JSON.parse(response.data.choices[0].message.content);
    return result.fixedCode || brokenComponentCode;
  } catch (error) {
    // Fallback: simple Tailwind fix
    return brokenComponentCode.replace(/px-2 py-1/g, 'px-6 py-3').replace('text-sm', 'text-base');
  }
}

module.exports = { generateCodePatch };
