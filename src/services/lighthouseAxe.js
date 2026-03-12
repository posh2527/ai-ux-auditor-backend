const lighthouse = require('lighthouse');
const { axeRun } = require('axe-core');

async function runLighthouseAxe(url) {
  // Lighthouse
  const lh = await lighthouse(url, { onlyCategories: ['accessibility'] });
  
  // axe-core
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const axeResults = await page.evaluate(axeRun, document);
  
  return { lh: lh.lhr.categories.accessibility, axe: axeResults.violations };
}
module.exports = { runLighthouseAxe };
