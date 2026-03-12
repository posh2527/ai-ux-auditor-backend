const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function takeScreenshot(url) {
  console.log('📸 Screenshot START (Playwright):', url);
  
  const browser = await chromium.launch({ 
    headless: true 
  });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }
  });
  const page = await context.newPage();
  
  await page.goto(url, { waitUntil: 'networkidle' });
  
  const timestamp = Date.now();
  const filename = `screenshot-${timestamp}.png`;
  const dir = path.join(process.cwd(), 'public', 'screenshots');
  const filepath = path.join(dir, filename);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  await page.screenshot({ path: filepath });
  await browser.close();
  
  // Verify
  if (!fs.existsSync(filepath)) {
    throw new Error(`Screenshot failed: ${filepath}`);
  }
  
  console.log('✅ Screenshot SAVED:', `/screenshots/${filename}`);
  console.log('📁 Size:', fs.statSync(filepath).size, 'bytes');
  
  return `/screenshots/${filename}`;
}

module.exports = { takeScreenshot };
