const { chromium } = require('playwright');

async function extractDOM(url) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  const html = await page.content();
  await browser.close();
  return html;
}

module.exports = { extractDOM };
